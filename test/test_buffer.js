var assert = require('assert');

module.exports = function(options) {
  var server_socket = options.server_socket;
  var client = options.client;
  var utility = require('utility');

  return function(callback) {
    console.log('Test Send Buffer');
    var message = require('./test_lib').getRandomBuffer(10);

    console.time('sendBuffer');
    console.log(message);
    server_socket.on('sendBuffer', function(msg) {
      console.log(msg);
      console.timeEnd('sendBuffer');
      assert(Buffer.isBuffer(msg) && utility.md5(msg) === utility.md5(message));
      callback();
    });
    client.emit('sendBuffer', message);
  }
}
