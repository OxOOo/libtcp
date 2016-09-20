var assert = require('assert');

module.exports = function(options) {
  var server_socket = options.server_socket;
  var client = options.client;
  var utility = require('utility');

  return function(callback) {
    console.log('Test Send Array');
    var message = [1, 2, 'abcdef'];

    console.time('sendArray');
    console.log(message);
    server_socket.on('sendArray', function(msg) {
      console.log(msg);
      console.timeEnd('sendArray');
      assert(utility.md5(msg) === utility.md5(message));
      callback();
    });
    client.emit('sendArray', message);
  }
}
