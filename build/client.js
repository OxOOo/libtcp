/// <reference path="../typings/index.d.ts" />
"use strict";
const socket_1 = require('./socket');
const I = require('./interfaces');
class Client extends socket_1.Socket {
    constructor(options = {}) {
        super(options);
        this.options = options;
    }
    connect(address, port, connectListener) {
        this.state = I.SocketState.connecting;
        if (connectListener) {
            this.once('connect', connectListener);
        }
        this._socket.connect(port, address);
    }
}
exports.Client = Client;
