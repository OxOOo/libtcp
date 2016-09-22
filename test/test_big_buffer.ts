/// <reference types="node" />

import {Server, Client, Socket, I} from '../src';
import assert = require('assert');

export = function (options: any) {
  let server_socket: Socket = options.server_socket;
  let client: Client = options.client;
  let utility = require('utility');

  return new Promise(function (resolve, reject) {
    console.log('Test Send BIG Buffer');
    let length = Math.floor(1024 * 1024 * 100);//100 MB
    let message = require('./test_lib').getRandomBuffer(length);

    console.time('sendBigBuffer');
    console.log(message);
    server_socket.on('sendBigBuffer', function (msg: any) {
      console.log(msg);
      console.timeEnd('sendBigBuffer');
      assert(Buffer.isBuffer(msg) && utility.md5(msg) === utility.md5(message));
      resolve();
    });
    client.emit('sendBigBuffer', message);
  });
}
