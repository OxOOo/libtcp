/// <reference types="node" />
"use strict";
const socket_1 = require("./socket");
const I = require("./interfaces");
class Client extends socket_1.Socket {
    constructor(options = {}) {
        super(options);
        this.options = options;
    }
    connect(address, port) {
        return new Promise((resolve, reject) => {
            let connect = () => {
                resolve();
                this.removeListener('connect', connect);
                this.removeListener('error', error);
            };
            let error = (err) => {
                reject(err);
                this.removeListener('connect', connect);
                this.removeListener('error', error);
            };
            this.once('connect', connect);
            this.once('error', error);
            this.state = I.SocketState.connecting;
            this._socket.connect(port, address);
        });
    }
}
exports.Client = Client;
