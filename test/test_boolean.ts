/// <reference path="../typings/index.d.ts" />

import {Server, Client, Socket, I} from '../src';
import assert = require('assert');

export = function (options: any) {
  var server_socket: Socket = options.server_socket;
  var client: Client = options.client;

  return new Promise(function (resolve, reject) {
    console.log('Test Send True');
    var message = true;

    console.time('sendTrue');
    console.log(message);
    server_socket.on('sendTrue', function (msg: any) {
      console.log(msg);
      console.timeEnd('sendTrue');
      assert(msg === message);
      resolve();
    });
    client.emit('sendTrue', message);
  });
}
