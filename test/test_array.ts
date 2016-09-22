/// <reference types="node" />

import {Server, Client, Socket, I} from '../src';
import assert = require('assert');

export = function (options: any) {
  let server_socket: Socket = options.server_socket;
  let client: Client = options.client;
  let utility = require('utility');

  return new Promise(function (resolve, reject) {
    console.log('Test Send Array');
    let message = [1, 2, 'abcdef'];

    console.time('sendArray');
    console.log(message);
    server_socket.on('sendArray', function (msg: any) {
      console.log(msg);
      console.timeEnd('sendArray');
      assert(utility.md5(msg) === utility.md5(message));
      resolve();
    });
    client.emit('sendArray', message);
  });
}
