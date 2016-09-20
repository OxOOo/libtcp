/// <reference path="../typings/index.d.ts" />

import {Socket} from './socket';
import I = require('./interfaces');

export class Client extends Socket {
  constructor(public options: I.Options = {}) {
    super(options);
  }

  public connect(address: string, port: number, connectListener?: Function) {
    this.state = I.SocketState.connecting;
    if (connectListener) {
      this.once('connect', connectListener);
    }
    this._socket.connect(port, address);
  }
}
