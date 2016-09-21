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
        this._server.on('connection', (s) => {
            var socket = new socket_1.Socket(this.options, s, ++this._sockets_id);
            this.sockets.push(socket);
            var broadcast = (event, arg) => {
                this.socketsEmitter.emit(event, socket, arg);
            };
            var remove = () => {
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
