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
        var index = this._index = (this._index + 1) % Socket._INDEX_MOD;
        this._sendDataPackage({
            event: event,
            arg: arg
        }, index, callback);
        return true;
    }
    _encode(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            for (var i = 0; i < this._dprocesses.length; i++) {
                buffer = yield this._dprocesses[i].encode(buffer);
            }
            return buffer;
        });
    }
    _decode(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            for (var i = this._dprocesses.length - 1; i >= 0; i--) {
                buffer = yield this._dprocesses[i].decode(buffer);
            }
            return buffer;
        });
    }
    _sendDataPackage(data_package, index, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME
            var data_buffer = SH.dataPackage2Buffer(data_package, index);
            data_buffer = yield this._encode(data_buffer);
            var length_buffer = SH.number2Buffer(data_buffer.length);
            this._socket.write(Buffer.concat([length_buffer, data_buffer]));
        });
    }
    _receive() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            var length_data = SH.buffer2Number(this._received_data);
            if (length_data == null || this._received_data.length < length_data.length + length_data.value)
                return;
            var data_buffer = this._received_data.slice(length_data.length, length_data.length + length_data.value);
            this._received_data = this._received_data.slice(length_data.length + length_data.value);
            data_buffer = yield this._decode(data_buffer);
            var data_package = SH.buffer2DataPackage(data_buffer);
            if (data_package.type == I.ReceivedDataType.send) {
                _super("emit").call(this, data_package.event, data_package.arg);
                _super("emit").call(this, Socket.ALL_DATA_MESSAGE, data_package.event, data_package.arg);
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
Socket.DATA_DELAY = 50;
Socket.ALL_DATA_MESSAGE = '___receive_data___';
Socket._INDEX_MOD = Math.pow(2, 25);
