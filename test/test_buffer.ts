/// <reference path="../typings/index.d.ts" />

import {Server, Client, Socket, I} from '../src';
import assert = require('assert');

export = function (options: any) {
  var server_socket: Socket = options.server_socket;
  var client: Client = options.client;
  var utility = require('utility');

  return new Promise(function (resolve, reject) {
    console.log('Test Send Buffer');
    var message = require('./test_lib').getRandomBuffer(10);

    console.time('sendBuffer');
    console.log(message);
    server_socket.on('sendBuffer', function (msg: any) {
      console.log(msg);
      console.timeEnd('sendBuffer');
      assert(Buffer.isBuffer(msg) && utility.md5(msg) === utility.md5(message));
      resolve();
    });
    client.emit('sendBuffer', message);
  });
}
