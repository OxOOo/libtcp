/// <reference types="node" />

import {Server, Client, Socket, I} from '../src';
import assert = require('assert');

export = function (options: any) {
  var server: Server = options.server;
  var server_socket: Socket = options.server_socket;
  var client: Client = options.client;
  var utility = require('utility');

  return new Promise(function (resolve, reject) {
    console.log('Test Send Broadcast');
    var message = require('./test_lib').getRandomBuffer(10);

    console.time('sendBroadcast');
    console.log(message);
    client.on('sendBroadcast', function (msg: any) {
      console.log(msg);
      console.timeEnd('sendBroadcast');
      assert(Buffer.isBuffer(msg) && utility.md5(msg) === utility.md5(message));
      resolve();
    });
    server.broadcast('sendBroadcast', message);
  });
}
