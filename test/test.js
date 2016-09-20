var async = require('async');

async.auto({
  start: function(callback) {
    //Start Server and Client
    require('./start_server_client')({
      // compress: 'zlib',
    }, callback);
  },
  test: ['start', function(callback, result) {
    //Start Test
    var options = result.start;
    async.series([
      require('./test_string')(options),
      require('./test_object')(options),
      require('./test_number')(options),
      require('./test_boolean')(options),
      require('./test_null')(options),
      require('./test_buffer')(options),
      require('./test_big_buffer')(options),
      require('./test_array')(options),
      require('./test_mix_object')(options),
      require('./test_mix_array')(options),
      require('./test_broadcast')(options),
    ], callback);
  }],
  close: ['test', 'start', function(callback, result) {
    result.start.server.close();
    result.start.client.close();
    callback();
  }]
}, function(error) {
  console.log('\n\n');
  if (error) {
    console.log('Test Fail');
    console.log(error);
  } else {
    console.log('Test OK');
  }
});
