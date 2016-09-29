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
        this._pending_event_callbacks = [];
        this._timeouts = [];
        this._timeouts_handle = null;
        this._server.on('connection', (s) => {
            let socket = new socket_1.Socket(this.options, s, ++this._sockets_id);
            this.sockets.push(socket);
            this._sync_callbacks.forEach((c) => {
                socket.onSync(c.event, (arg) => {
                    return c.listener(socket, arg);
                });
            });
            let broadcast = (event, arg) => {
                let callbacks = this._pending_event_callbacks.filter((e) => {
                    return e.event == event;
                });
                callbacks.forEach(e => { e.resolve(arg); });
                this._pending_event_callbacks = this._pending_event_callbacks.filter((e) => {
                    return e.event != event;
                });
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
    listen(address, port) {
        return new Promise((resolve, reject) => {
            let listening = () => {
                resolve();
                this._server.removeListener('listening', listening);
                this._server.removeListener('error', error);
            };
            let error = (err) => {
                reject(err);
                this._server.removeListener('listening', listening);
                this._server.removeListener('error', error);
            };
            this._server.once('listening', listening);
            this._server.once('error', error);
            this._server.listen(port, address);
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
    waitForEvent(event, timeout = 0) {
        return new Promise((resolve, reject) => {
            this._pending_event_callbacks.push({
                event: event,
                resolve: resolve,
                reject: reject
            });
            if (timeout != 0)
                this._registerTimeout(event, Date.now() + timeout);
        });
    }
    _registerTimeout(event, clock) {
        this._timeouts.push({
            event: event,
            clock: clock
        });
        this._buildTimeout();
    }
    _buildTimeout() {
        if (this._timeouts_handle != null) {
            clearTimeout(this._timeouts_handle);
            this._timeouts_handle = null;
        }
        let now = Date.now();
        let timeouts = this._timeouts.filter(t => { return t.clock < now; });
        this._timeouts = this._timeouts.filter(t => { return t.clock >= now; });
        let events = timeouts.map(t => { return t.event; });
        let event_callbacks = this._pending_event_callbacks.filter(t => { return events.indexOf(t.event) != -1; });
        this._pending_event_callbacks = this._pending_event_callbacks.filter(t => { return events.indexOf(t.event) == -1; });
        event_callbacks.forEach(t => { return t.reject(new Error('timeout')); });
        let clock = 0;
        this._timeouts.forEach(t => {
            if (clock == 0 || clock > t.clock)
                clock = t.clock;
        });
        if (clock != 0) {
            this._timeouts_handle = setTimeout(() => { this._buildTimeout(); }, clock - Date.now() + 5);
        }
    }
}
exports.Server = Server;
