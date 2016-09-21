/// <reference types="node" />

import {Server, Client, Socket, I} from '../src';
import assert = require('assert');

export = function (options: any) {
  var server_socket: Socket = options.server_socket;
  var client: Client = options.client;

  return new Promise(function (resolve, reject) {
    console.log('Test Send Null');
    var message: any = null;

    console.time('sendNull');
    console.log(message);
    server_socket.on('sendNull', function (msg: any) {
      console.log(msg);
      console.timeEnd('sendNull');
      assert(msg === message);
      resolve();
    });
    client.emit('sendNull', message);
  });
}
