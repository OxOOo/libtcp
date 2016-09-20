var assert = require('assert');

module.exports = function(options) {
  var server_socket = options.server_socket;
  var client = options.client;

  return function(callback) {
    console.log('Test Send True');
    var message = true;

    console.time('sendTrue');
    console.log(message);
    server_socket.on('sendTrue', function(msg) {
      console.log(msg);
      console.timeEnd('sendTrue');
      assert(msg === message);
      callback();
    });
    client.emit('sendTrue', message);
  }
}
