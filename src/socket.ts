/// <reference types="node" />

import net = require("net");
import {EventEmitter} from 'events';
import I = require('./interfaces');
import dprocess = require('./dprocess');
import SH = require('./helpers/socket');

export class Socket extends EventEmitter {
	public static DATA_DELAY = 50;
	public static ALL_DATA_MESSAGE = '___receive_data___';

	public locals: Object = {};
	public state: I.SocketState = I.SocketState.pending;

	private _pending_data_chunks: Buffer[] = [];
	private _received_data: Buffer = new Buffer(''); // data received on previous
	private _index = 0; // the index of data packages, will inc when send a data
	private static _INDEX_MOD = Math.pow(2, 25);
	private _dprocesses: dprocess.BaseDProcess[] = [];
	private _time_handle: NodeJS.Timer = null;

	constructor(public options: I.Options, protected _socket: net.Socket = null, public id: number = 0) {
		super();

		this._socket = _socket || new net.Socket(); // Socket for network
		if (_socket != null) {
			this.state = I.SocketState.connected;
		}

		if (this.options.crypto) {
			this.options.crypto.forEach((crypto) => {
				var dp = new dprocess.CryptoDProcess(crypto.algorithm, crypto.secret_key);
				this._dprocesses.push(dp);
			});
		}

		if (options.compress === 'zlib') {
			this._dprocesses.push(new dprocess.ZlibDProcess());
		}

		this._socket.on('data', (chunk: Buffer) => {
			if (this._time_handle) clearTimeout(this._time_handle);
			if (chunk instanceof String) {
				this._pending_data_chunks.push(new Buffer(chunk));
			} else {
				this._pending_data_chunks.push(chunk);
			}

			this._time_handle = setTimeout(() => {
				this._time_handle = null;
				this._pending_data_chunks.unshift(this._received_data);
				this._received_data = Buffer.concat(this._pending_data_chunks);
				this._pending_data_chunks = [];
				try {
					this._receive();
				} catch (err) {
					super.emit(err);
				}
			}, Socket.DATA_DELAY);
		});

		this._socket.on('close', (had_error: any) => {
			this.state = I.SocketState.closed;
			super.emit('close', had_error);
		});
		this._socket.on('connect', () => {
			this.state = I.SocketState.connected;
			super.emit('connect');
		});
		this._socket.on('end', () => {
			super.emit('end');
		});
		this._socket.on('error', (error: any) => {
			super.emit('error', error);
		});
	}

	//socket functions
	public address() {
		return this._socket.address();
	}

	public close() {
		this.state = I.SocketState.closing;
		this._socket.end();
	}

	public emit(event: string, arg: any, callback?: Function): boolean {
		if (this.state !== I.SocketState.connected && this.state !== I.SocketState.connecting)
			throw new Error('Socket state is ' + I.SocketState[this.state]);

		arg = arg || null;

		var index = this._index = (this._index + 1) % Socket._INDEX_MOD;
		this._sendDataPackage({
			event: event,
			arg: arg
		}, index, callback);
		return true;
	}

	private async _encode(buffer: Buffer) {
		for (var i = 0; i < this._dprocesses.length; i++) {
			buffer = await this._dprocesses[i].encode(buffer);
		}
		return buffer;
	}
	private async _decode(buffer: Buffer) {
		for (var i = this._dprocesses.length - 1; i >= 0; i--) {
			buffer = await this._dprocesses[i].decode(buffer);
		}
		return buffer;
	}
	private async _sendDataPackage(data_package: I.DataPackage, index: number, callback: Function) {
		// FIXME
		var data_buffer = SH.dataPackage2Buffer(data_package, index);
		data_buffer = await this._encode(data_buffer);
		var length_buffer = SH.number2Buffer(data_buffer.length);
		this._socket.write(Buffer.concat([length_buffer, data_buffer]));
	}
	private async _receive() {
		var length_data = SH.buffer2Number(this._received_data);
		if (length_data == null || this._received_data.length < length_data.length + length_data.value) return;
		var data_buffer = this._received_data.slice(length_data.length, length_data.length + length_data.value);
		this._received_data = this._received_data.slice(length_data.length + length_data.value);

		data_buffer = await this._decode(data_buffer);
		var data_package = SH.buffer2DataPackage(data_buffer);
		if (data_package.type == I.ReceivedDataType.send) {
			super.emit(data_package.event, data_package.arg);
			super.emit(Socket.ALL_DATA_MESSAGE, data_package.event, data_package.arg);
		} else {
			throw new Error('Unknow data');
		}
		process.nextTick(() => {
			this._receive();
		});
		return;
	}
}
