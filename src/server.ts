/// <reference types="node" />

import net = require("net");
import { EventEmitter } from 'events';
import { Socket } from './socket';
import I = require('./interfaces');

export class Server extends EventEmitter {

	public sockets: Socket[] = [];
	public socketsEmitter = new EventEmitter();

	private _server = net.createServer();
	private _sockets_id = 0;
	private _sync_callbacks: Array<{
		event: string;
		listener: (socket: Socket, arg: any) => Promise<any>;
	}> = [];

	constructor(public options: I.Options = {}) {
		super();

		this._server.on('connection', (s: net.Socket) => {
			let socket = new Socket(this.options, s, ++this._sockets_id);
			this.sockets.push(socket);
			this._sync_callbacks.forEach((c) => {
				socket.onSync(c.event, (arg: any) => {
					return c.listener(socket, arg);
				});
			});
			let broadcast = (event: string, arg: any) => {
				this.socketsEmitter.emit(event, socket, arg);
			}
			let remove = () => {
				this.sockets.splice(this.sockets.indexOf(socket), 1);
				this.socketsEmitter.emit('remove', socket);
			}
			socket.on('close', remove);
			socket.on("error", remove);
			socket.on(Socket.ALL_DATA_MESSAGE, broadcast);
			super.emit('connection', socket);
		});

		this._server.on('close', () => {
			super.emit('close');
		});
		this._server.on('error', (error: any) => {
			super.emit('error', error);
		});
		this._server.on('listening', () => {
			super.emit('listening');
		});
	}

	public listen(address: string, port: number, callback?: Function) {
		if (callback) {
			this.once('listening', callback);
		}
		this._server.listen(port, address);
	}

	public onSocketSync(event: string, listener: (socket: Socket, arg: any) => Promise<any>) {
		this.sockets.forEach((s) => {
			let socket = s;
			socket.onSync(event, (arg: any) => {
				return listener(socket, arg);
			});
		});
		this._sync_callbacks.push({
			event: event,
			listener: listener
		});
	}

	public address() {
		return this._server.address();
	}

	public close(callback?: Function) {
		if (callback) {
			this.once('close', callback);
		}
		this._server.close();
		return this;
	}

	public broadcast(event: string, arg?: any, except?: Socket[] | Socket) {
		this.sockets.forEach((socket) => {
			if (except instanceof Array && except.indexOf(socket) !== -1) return;
			if (except == socket) return;
			socket.emit(event, arg);
		});
	}
}
