var assert = require('assert');

module.exports = function(options) {
  var server_socket = options.server_socket;
  var client = options.client;
  var utility = require('utility');

  return function(callback) {
    console.log('Test Send Mix Object');
    var message = {
      message: '7887hj',
      count: 2,
      obj: {abc: 1},
      buffer: require('./test_lib').getRandomBuffer(10),
      array: [1, 2, 3, require('./test_lib').getRandomBuffer(20)]
    };

    console.time('sendMixObject');
    console.log(message);
    server_socket.on('sendMixObject', function(msg) {
      console.log(msg);
      console.timeEnd('sendMixObject');
      assert(utility.md5(msg) === utility.md5(message));
      callback();
    });
    client.emit('sendMixObject', message);
  }
}
