var Server = require('../index').Server;

var PORT = 3766;
var options = {
  // compress: 'zlib',
}

var server = new Server(options);
server.on('connection', function(socket) {
  console.log('[Server]New Connection');

  socket.on('message', function(message) {
    console.log(message);
    // message will be 2
  });

  socket.emit('sendString', 'hello world');

  socket.emit('sendObject', {
    message: '123',
    count: 23
  });

  var buffer = new Buffer(4);
  buffer.writeUInt32BE(0x1234, 0);
  socket.emit('sendBuffer', buffer);

  socket.emit('endSend');
});
server.listen(PORT, function() {
  console.log('Server Started');
});
