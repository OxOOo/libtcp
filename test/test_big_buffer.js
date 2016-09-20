var assert = require('assert');

module.exports = function(options) {
  var server_socket = options.server_socket;
  var client = options.client;
  var utility = require('utility');

  return function(callback) {
    console.log('Test Send BIG Buffer');
    var length = Math.floor(1024 * 1024 * 100);//100 MB
    var message = require('./test_lib').getRandomBuffer(length);

    console.time('sendBigBuffer');
    console.log(message);
    server_socket.on('sendBigBuffer', function(msg) {
      console.log(msg);
      console.timeEnd('sendBigBuffer');
      assert(Buffer.isBuffer(msg) && utility.md5(msg) === utility.md5(message));
      callback();
    });
    client.emit('sendBigBuffer', message);
  }
}
