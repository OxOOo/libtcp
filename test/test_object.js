var assert = require('assert');

module.exports = function(options) {
  var server_socket = options.server_socket;
  var client = options.client;
  var utility = require('utility');

  return function(callback) {
    console.log('Test Send Object');
    var message = {
      message: '_asda_',
      count: 2,
      obj: {abc: 1}
    };

    console.time('sendObject');
    console.log(message);
    server_socket.on('sendObject', function(msg) {
      console.log(msg);
      console.timeEnd('sendObject');
      assert(utility.md5(msg) === utility.md5(message));
      callback();
    });
    client.emit('sendObject', message);
  }
}
