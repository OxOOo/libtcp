/// <reference types="node" />

import { Server, Client, Socket, I } from '../src';
import assert = require('assert');

export = function (options: any) {
  var server_socket: Socket = options.server_socket;
  var client: Client = options.client;

  return new Promise(function (resolve, reject) {
    console.log('Test Callback');
    var message = '_message';
    var handle = setTimeout(() => {
      reject();
    }, 1000);

    console.time('callback');
    client.emit('callback', message, () => {
      console.timeEnd('callback');
      clearTimeout(handle);
      resolve();
    });
  });
}
