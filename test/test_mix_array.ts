/// <reference path="../node_modules/@types/node/index.d.ts" />

import {Server, Client, Socket, I} from '../src';
import assert = require('assert');

export = function (options: any) {
  var server_socket: Socket = options.server_socket;
  var client: Client = options.client;
  var utility = require('utility');

  return new Promise(function (resolve, reject) {
    console.log('Test Send Mix Array');
    var message = [1, 2, 3, require('./test_lib').getRandomBuffer(20), { abc: 1 }, 'abcdef'];

    console.time('sendMixArray');
    console.log(message);
    server_socket.on('sendMixArray', function (msg: any) {
      console.log(msg);
      console.timeEnd('sendMixArray');
      assert(utility.md5(msg) === utility.md5(message));
      resolve();
    });
    client.emit('sendMixArray', message);
  });
}
