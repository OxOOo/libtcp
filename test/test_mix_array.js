var assert = require('assert');

module.exports = function(options) {
  var server_socket = options.server_socket;
  var client = options.client;
  var utility = require('utility');

  return function(callback) {
    console.log('Test Send Mix Array');
    var message = [1, 2, 3, require('./test_lib').getRandomBuffer(20), {abc: 1}, 'abcdef'];

    console.time('sendMixArray');
    console.log(message);
    server_socket.on('sendMixArray', function(msg) {
      console.log(msg);
      console.timeEnd('sendMixArray');
      assert(utility.md5(msg) === utility.md5(message));
      callback();
    });
    client.emit('sendMixArray', message);
  }
}
