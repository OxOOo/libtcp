/// <reference types="node" />

import {Server, Client, Socket, I} from '../src';
import assert = require('assert');

module.exports = function (options: any) {
  let server_socket: Socket = options.server_socket;
  let client: Client = options.client;
  let utility = require('utility');

  return new Promise(function (resolve, reject) {
    console.log('Test Send Mix Object');
    let message = {
      message: '7887hj',
      count: 2,
      obj: { abc: 1 },
      buffer: require('./test_lib').getRandomBuffer(10),
      array: [1, 2, 3, require('./test_lib').getRandomBuffer(20)]
    };

    console.time('sendMixObject');
    console.log(message);
    server_socket.on('sendMixObject', function (msg: any) {
      console.log(msg);
      console.timeEnd('sendMixObject');
      assert(utility.md5(msg) === utility.md5(message));
      resolve();
    });
    client.emit('sendMixObject', message);
  });
}
