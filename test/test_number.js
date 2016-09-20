var assert = require('assert');

module.exports = function(options) {
  var server_socket = options.server_socket;
  var client = options.client;

  return function(callback) {
    console.log('Test Send Number');
    var message = 3;

    console.time('sendNumber');
    console.log(message);
    server_socket.on('sendNumber', function(msg) {
      console.log(msg);
      console.timeEnd('sendNumber');
      assert(msg === message);
      callback();
    });
    client.emit('sendNumber', message);
  }
}
