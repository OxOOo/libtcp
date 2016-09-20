var utility = require('utility');

module.exports.getRandomBuffer = function(length) {
  var buffer = new Buffer(length);
  for(var i = 0; i < buffer.length; i ++)
    buffer[i] = Math.floor(Math.random()*256);
  return buffer;
}

var md5 = utility.md5;
utility.md5 = function(value) {
  if (Buffer.isBuffer(value) || typeof(value) === 'string') {
    return md5(value);
  } else if (Array.isArray(value)) {
    var result = '';
    value.forEach(function(v) {
      result += utility.md5(v);
    });
    return utility.md5(result);
  } else if (typeof(value) === 'object' && value) {
    var result = '';
    var keys = Object.keys(value);
    keys.sort();
    keys.forEach(function(key) {
      result += utility.md5(key);
      result += utility.md5(value[key]);
    });
    return utility.md5(result);
  } else return md5(String(value));
}
