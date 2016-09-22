/// <reference types="node" />
"use strict";
const net = require("net");
const events_1 = require("events");
const socket_1 = require("./socket");
class Server extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.options = options;
        this.sockets = [];
        this.socketsEmitter = new events_1.EventEmitter();
        this._server = net.createServer();
        this._sockets_id = 0;
        this._sync_callbacks = [];
        this._server.on('connection', (s) => {
            let socket = new socket_1.Socket(this.options, s, ++this._sockets_id);
            this.sockets.push(socket);
            this._sync_callbacks.forEach((c) => {
                socket.onSync(c.event, (arg) => {
                    return c.listener(socket, arg);
                });
            });
            let broadcast = (event, arg) => {
                this.socketsEmitter.emit(event, socket, arg);
            };
            let remove = () => {
                this.sockets.splice(this.sockets.indexOf(socket), 1);
                this.socketsEmitter.emit('remove', socket);
            };
            socket.on('close', remove);
            socket.on("error", remove);
            socket.on(socket_1.Socket.ALL_DATA_MESSAGE, broadcast);
            super.emit('connection', socket);
        });
        this._server.on('close', () => {
            super.emit('close');
        });
        this._server.on('error', (error) => {
            super.emit('error', error);
        });
        this._server.on('listening', () => {
            super.emit('listening');
        });
    }
    listen(address, port, callback) {
        if (callback) {
            this.once('listening', callback);
        }
        this._server.listen(port, address);
    }
    onSocketSync(event, listener) {
        this.sockets.forEach((s) => {
            let socket = s;
            socket.onSync(event, (arg) => {
                return listener(socket, arg);
            });
        });
        this._sync_callbacks.push({
            event: event,
            listener: listener
        });
    }
    address() {
        return this._server.address();
    }
    close(callback) {
        if (callback) {
            this.once('close', callback);
        }
        this._server.close();
        return this;
    }
    broadcast(event, arg, except) {
        this.sockets.forEach((socket) => {
            if (except instanceof Array && except.indexOf(socket) !== -1)
                return;
            if (except == socket)
                return;
            socket.emit(event, arg);
        });
    }
}
exports.Server = Server;
