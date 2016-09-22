/// <reference types="node" />

import {Server, Client, Socket, I} from '../src';
import assert = require('assert');

export = function (options: any) {
  let server_socket: Socket = options.server_socket;
  let client: Client = options.client;
  let utility = require('utility');

  return new Promise(function (resolve, reject) {
    console.log('Test Send Object');
    let message = {
      message: '_asda_',
      count: 2,
      obj: { abc: 1 }
    };

    console.time('sendObject');
    console.log(message);
    server_socket.on('sendObject', function (msg: any) {
      console.log(msg);
      console.timeEnd('sendObject');
      assert(utility.md5(msg) === utility.md5(message));
      resolve();
    });
    client.emit('sendObject', message);
  });
}
