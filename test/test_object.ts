/// <reference types="node" />

import {Server, Client, Socket, I} from '../src';
import assert = require('assert');

export = function (options: any) {
  var server_socket: Socket = options.server_socket;
  var client: Client = options.client;
  var utility = require('utility');

  return new Promise(function (resolve, reject) {
    console.log('Test Send Object');
    var message = {
      message: '_asda_',
      count: 2,
      obj: { abc: 1 }
    };

    console.time('sendObject');
    console.log(message);
    server_socket.on('sendObject', function (msg: any) {
      console.log(msg);
      console.timeEnd('sendObject');
      assert(utility.md5(msg) === utility.md5(message));
      resolve();
    });
    client.emit('sendObject', message);
  });
}
