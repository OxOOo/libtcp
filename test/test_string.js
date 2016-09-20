var assert = require('assert');

module.exports = function(options) {
  var server_socket = options.server_socket;
  var client = options.client;

  return function(callback) {
    console.log('Test Send String');
    var message = '_message';

    console.time('sendString');
    console.log(message);
    server_socket.on('sendString', function(msg) {
      console.log(msg);
      console.timeEnd('sendString');
      assert(msg === message);
      callback();
    });
    client.emit('sendString', message);
  }
}
