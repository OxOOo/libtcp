/// <reference types="node" />

import {Server, Client, Socket, I} from '../src';
import assert = require('assert');

export = function (options: any) {
  let server_socket: Socket = options.server_socket;
  let client: Client = options.client;

  return new Promise(function (resolve, reject) {
    console.log('Test Send Number');
    let message = 3;

    console.time('sendNumber');
    console.log(message);
    server_socket.on('sendNumber', function (msg: any) {
      console.log(msg);
      console.timeEnd('sendNumber');
      assert(msg === message);
      resolve();
    });
    client.emit('sendNumber', message);
  });
}
