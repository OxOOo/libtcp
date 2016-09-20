var assert = require('assert');

module.exports = function(options) {
  var server_socket = options.server_socket;
  var client = options.client;

  return function(callback) {
    console.log('Test Send Null');
    var message = null;

    console.time('sendNull');
    console.log(message);
    server_socket.on('sendNull', function(msg) {
      console.log(msg);
      console.timeEnd('sendNull');
      assert(msg === message);
      callback();
    });
    client.emit('sendNull', message);
  }
}
