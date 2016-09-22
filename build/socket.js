/// <reference types="node" />
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const net = require("net");
const events_1 = require("events");
const I = require("./interfaces");
const dprocess = require("./dprocess");
const SH = require("./helpers/socket");
class Socket extends events_1.EventEmitter {
    constructor(options, _socket = null, id = 0) {
        super();
        this.options = options;
        this._socket = _socket;
        this.id = id;
        this.locals = {};
        this.state = I.SocketState.pending;
        this._pending_data_chunks = [];
        this._received_data = new Buffer(''); // data received on previous
        this._index = 0; // the index of data packages, will inc when send a data
        this._dprocesses = [];
        this._time_handle = null;
        this._pending_callbacks = [];
        this._pending_sync_callbacks = [];
        this._socket = _socket || new net.Socket(); // Socket for network
        if (_socket != null) {
            this.state = I.SocketState.connected;
        }
        if (this.options.crypto) {
            let dp = new dprocess.CryptoDProcess(this.options.crypto.algorithm, this.options.crypto.secret_key);
            this._dprocesses.push(dp);
        }
        if (options.compress === 'zlib') {
            this._dprocesses.push(new dprocess.ZlibDProcess());
        }
        this._socket.on('data', (chunk) => {
            if (this._time_handle)
                clearTimeout(this._time_handle);
            if (chunk instanceof String) {
                this._pending_data_chunks.push(new Buffer(chunk));
            }
            else {
                this._pending_data_chunks.push(chunk);
            }
            this._time_handle = setTimeout(() => {
                this._time_handle = null;
                this._pending_data_chunks.unshift(this._received_data);
                this._received_data = Buffer.concat(this._pending_data_chunks);
                this._pending_data_chunks = [];
                try {
                    this._receive();
                }
                catch (err) {
                    super.emit(err);
                }
            }, Socket.DATA_DELAY);
        });
        this._socket.on('close', (had_error) => {
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
        this._socket.on('error', (error) => {
            super.emit('error', error);
        });
    }
    //socket functions
    address() {
        return this._socket.address();
    }
    close() {
        this.state = I.SocketState.closing;
        this._socket.end();
    }
    emit(event, arg, callback) {
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
    emitSync(event, arg) {
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
    onSync(event, listener) {
        if (this._getSyncFunction(event)) {
            throw new Error('can not double listen sync function');
        }
        this.on(event + Socket.SYNC_MESSAGE, listener);
    }
    _getSyncFunction(event) {
        let listener = null;
        if (this.listenerCount(event + Socket.SYNC_MESSAGE) > 0)
            listener = this.listeners(event + Socket.SYNC_MESSAGE)[0];
        return listener;
    }
    _encode(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this._dprocesses.length; i++) {
                buffer = yield this._dprocesses[i].encode(buffer);
            }
            return buffer;
        });
    }
    _decode(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = this._dprocesses.length - 1; i >= 0; i--) {
                buffer = yield this._dprocesses[i].decode(buffer);
            }
            return buffer;
        });
    }
    _sendDataPackage(type, data_package, index) {
        return __awaiter(this, void 0, void 0, function* () {
            let data_buffer = SH.dataPackage2Buffer(type, data_package, index);
            data_buffer = yield this._encode(data_buffer);
            let length_buffer = SH.number2Buffer(data_buffer.length);
            this._socket.write(Buffer.concat([length_buffer, data_buffer]));
        });
    }
    _sendAccepted(index) {
        return __awaiter(this, void 0, void 0, function* () {
            let data_buffer = SH.acceptIndex2Buffer(index);
            data_buffer = yield this._encode(data_buffer);
            let length_buffer = SH.number2Buffer(data_buffer.length);
            this._socket.write(Buffer.concat([length_buffer, data_buffer]));
        });
    }
    _receive() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            let length_data = SH.buffer2Number(this._received_data);
            if (length_data == null || this._received_data.length < length_data.length + length_data.value)
                return;
            let data_buffer = this._received_data.slice(length_data.length, length_data.length + length_data.value);
            this._received_data = this._received_data.slice(length_data.length + length_data.value);
            data_buffer = yield this._decode(data_buffer);
            let data_package = SH.buffer2DataPackage(data_buffer);
            if (data_package.type == I.ReceivedDataType.send) {
                this._sendAccepted(data_package.index);
                _super("emit").call(this, data_package.event, data_package.arg);
                _super("emit").call(this, Socket.ALL_DATA_MESSAGE, data_package.event, data_package.arg);
            }
            else if (data_package.type == I.ReceivedDataType.accepted) {
                let callbacks = this._pending_callbacks.filter(e => { return e.index == data_package.index; });
                callbacks.forEach(e => { e.callback(); });
                this._pending_callbacks = this._pending_callbacks.filter(e => { return e.index != data_package.index; });
            }
            else if (data_package.type == I.ReceivedDataType.sendSync) {
                let listener = this._getSyncFunction(data_package.event);
                if (listener == null) {
                    yield this._sendDataPackage(I.ReceivedDataType.syncError, {
                        event: data_package.event,
                        arg: 'there is no sync listener'
                    }, data_package.index);
                }
                else {
                    try {
                        let reply = yield listener(data_package.arg);
                        yield this._sendDataPackage(I.ReceivedDataType.syncReply, {
                            event: data_package.event,
                            arg: reply
                        }, data_package.index);
                    }
                    catch (e) {
                        yield this._sendDataPackage(I.ReceivedDataType.syncError, {
                            event: data_package.event,
                            arg: e.toString()
                        }, data_package.index);
                    }
                }
            }
            else if (data_package.type == I.ReceivedDataType.syncReply) {
                let callbacks = this._pending_sync_callbacks.filter(e => { return e.index == data_package.index; });
                callbacks.forEach(e => { e.resolve(data_package.arg); });
                this._pending_sync_callbacks = this._pending_sync_callbacks.filter(e => { return e.index != data_package.index; });
            }
            else if (data_package.type == I.ReceivedDataType.syncError) {
                let callbacks = this._pending_sync_callbacks.filter(e => { return e.index == data_package.index; });
                callbacks.forEach(e => { e.reject(new Error(data_package.arg)); });
                this._pending_sync_callbacks = this._pending_sync_callbacks.filter(e => { return e.index != data_package.index; });
            }
            else {
                throw new Error('Unknow data');
            }
            process.nextTick(() => {
                this._receive();
            });
            return;
        });
    }
}
exports.Socket = Socket;
Socket.DATA_DELAY = 20;
Socket.ALL_DATA_MESSAGE = '___receive_data___';
Socket.SYNC_MESSAGE = '__SYNC__';
Socket._INDEX_MOD = Math.pow(2, 25);
