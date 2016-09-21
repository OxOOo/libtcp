/// <reference types="node" />

import {Server, Client, Socket, I} from '../src';
import assert = require('assert');

export = function (options: any) {
  var server_socket: Socket = options.server_socket;
  var client: Client = options.client;
  var utility = require('utility');

  return new Promise(function (resolve, reject) {
    console.log('Test Send Array');
    var message = [1, 2, 'abcdef'];

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
