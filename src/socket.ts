/// <reference types="node" />

import net = require("net");
import { EventEmitter } from 'events';
import I = require('./interfaces');
import dprocess = require('./dprocess');
import SH = require('./helpers/socket');

export class Socket extends EventEmitter {
	public static DATA_DELAY = 20;
	public static ALL_DATA_MESSAGE = '___receive_data___';
	private static SYNC_MESSAGE = '__SYNC__';

	public locals: any = {};
	public state: I.SocketState = I.SocketState.pending;

	private _pending_data_chunks: Buffer[] = [];
	private _received_data: Buffer = new Buffer(''); // data received on previous
	private _index = 0; // the index of data packages, will inc when send a data
	private static _INDEX_MOD = Math.pow(2, 25);
	private _dprocesses: dprocess.BaseDProcess[] = [];
	private _time_handle: NodeJS.Timer = null;
	private _pending_callbacks: { index: number; callback: Function }[] = [];
	private _pending_sync_callbacks: { index: number; resolve: Function; reject: Function }[] = [];

	constructor(public options: I.Options, protected _socket: net.Socket = null, public id: number = 0) {
		super();

		this._socket = _socket || new net.Socket(); // Socket for network
		if (_socket != null) {
			this.state = I.SocketState.connected;
		}

		if (this.options.crypto) {
			this.options.crypto.forEach((crypto) => {
				let dp = new dprocess.CryptoDProcess(crypto.algorithm, crypto.secret_key);
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

	public emit(event: string, arg?: any, callback?: Function): boolean {
		if (this.state !== I.SocketState.connected && this.state !== I.SocketState.connecting)
			throw new Error('Socket state is ' + I.SocketState[this.state]);
		arg = arg || null;

		let index = this._index = (this._index + 1) % Socket._INDEX_MOD;
		if (callback) {
			this._pending_callbacks.push({
				index: index,
				callback: callback
			});
		}
		this._sendDataPackage(I.ReceivedDataType.send, {
			event: event,
			arg: arg
		}, index);
		return true;
	}

	public emitSync(event: string, arg?: any) {
		arg = arg || null;

		return new Promise((resolve, reject) => {
			let index = this._index = (this._index + 1) % Socket._INDEX_MOD;
			this._pending_sync_callbacks.push({
				index: index,
				resolve: resolve,
				reject: reject
			});
			this._sendDataPackage(I.ReceivedDataType.sendSync, {
				event: event,
				arg: arg
			}, index);
		});
	}

	public onSync(event: string, listener: (arg: any) => Promise<any>) {
		if (this._getSyncFunction(event)) {
			throw new Error('can not double listen sync function');
		}
		this.on(event + Socket.SYNC_MESSAGE, listener);
	}

	private _getSyncFunction(event: string) {
		let listener: (arg: any) => Promise<any> = null;
		if (this.listenerCount(event + Socket.SYNC_MESSAGE) > 0)
			listener = <any>this.listeners(event + Socket.SYNC_MESSAGE)[0];
		return listener;
	}
	private async _encode(buffer: Buffer) {
		for (let i = 0; i < this._dprocesses.length; i++) {
			buffer = await this._dprocesses[i].encode(buffer);
		}
		return buffer;
	}
	private async _decode(buffer: Buffer) {
		for (let i = this._dprocesses.length - 1; i >= 0; i--) {
			buffer = await this._dprocesses[i].decode(buffer);
		}
		return buffer;
	}
	private async _sendDataPackage(type: I.ReceivedDataType, data_package: I.DataPackage, index: number) {
		let data_buffer = SH.dataPackage2Buffer(type, data_package, index);
		data_buffer = await this._encode(data_buffer);
		let length_buffer = SH.number2Buffer(data_buffer.length);
		this._socket.write(Buffer.concat([length_buffer, data_buffer]));
	}
	private async _sendAccepted(index: number) {
		let data_buffer = SH.acceptIndex2Buffer(index);
		data_buffer = await this._encode(data_buffer);
		let length_buffer = SH.number2Buffer(data_buffer.length);
		this._socket.write(Buffer.concat([length_buffer, data_buffer]));
	}
	private async _receive() {
		let length_data = SH.buffer2Number(this._received_data);
		if (length_data == null || this._received_data.length < length_data.length + length_data.value) return;
		let data_buffer = this._received_data.slice(length_data.length, length_data.length + length_data.value);
		this._received_data = this._received_data.slice(length_data.length + length_data.value);

		data_buffer = await this._decode(data_buffer);
		let data_package = SH.buffer2DataPackage(data_buffer);
		if (data_package.type == I.ReceivedDataType.send) {
			this._sendAccepted(data_package.index);
			super.emit(data_package.event, data_package.arg);
			super.emit(Socket.ALL_DATA_MESSAGE, data_package.event, data_package.arg);
		} else if (data_package.type == I.ReceivedDataType.accepted) {
			let callbacks = this._pending_callbacks.filter(e => { return e.index == data_package.index; });
			callbacks.forEach(e => { e.callback(); });
			this._pending_callbacks = this._pending_callbacks.filter(e => { return e.index != data_package.index; });
		} else if (data_package.type == I.ReceivedDataType.sendSync) {
			let listener = this._getSyncFunction(data_package.event);
			if (listener == null) {
				await this._sendDataPackage(I.ReceivedDataType.syncError, {
					event: data_package.event,
					arg: 'there is no sync listener'
				}, data_package.index);
			} else {
				try {
					let reply = await listener(data_package.arg);
					await this._sendDataPackage(I.ReceivedDataType.syncReply, {
						event: data_package.event,
						arg: reply
					}, data_package.index);
				} catch (e) {
					await this._sendDataPackage(I.ReceivedDataType.syncError, {
						event: data_package.event,
						arg: e.toString()
					}, data_package.index);
				}
			}
		} else if (data_package.type == I.ReceivedDataType.syncReply) {
			let callbacks = this._pending_sync_callbacks.filter(e => { return e.index == data_package.index; });
			callbacks.forEach(e => { e.resolve(data_package.arg); });
			this._pending_sync_callbacks = this._pending_sync_callbacks.filter(e => { return e.index != data_package.index; });
		} else if (data_package.type == I.ReceivedDataType.syncError) {
			let callbacks = this._pending_sync_callbacks.filter(e => { return e.index == data_package.index; });
			callbacks.forEach(e => { e.reject(new Error(data_package.arg)); });
			this._pending_sync_callbacks = this._pending_sync_callbacks.filter(e => { return e.index != data_package.index; });
		} else {
			throw new Error('Unknow data');
		}
		process.nextTick(() => {
			this._receive();
		});
		return;
	}
}
