var assert = require('assert');

module.exports = function(options) {
  var server = options.server;
  var server_socket = options.server_socket;
  var client = options.client;
  var utility = require('utility');

  return function(callback) {
    console.log('Test Send Broadcast');
    var message = require('./test_lib').getRandomBuffer(10);

    console.time('sendBroadcast');
    console.log(message);
    client.on('sendBroadcast', function(msg) {
      console.log(msg);
      console.timeEnd('sendBroadcast');
      assert(Buffer.isBuffer(msg) && utility.md5(msg) === utility.md5(message));
      callback();
    });
    server.broadcast('sendBroadcast', message);
  }
}
