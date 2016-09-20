
module.exports = function(options, callback) {
  console.log('Start Server and Client');

  var Server = require('../index').Server;
  var Client = require('../index').Client;
  var PORT = 3766;

  var server = new Server(options);
  var client = new Client(options);

  //Start Server
  server.listen(PORT, function() {
    console.log('Server Started');
  });

  server.on('connection', function(socket) {
    console.log('New Connection');
    var server_socket = socket;
    callback(null, {
      server: server,
      client: client,
      server_socket: server_socket
    });
  });

  //Start Client
  client.connect(PORT, 'localhost', function() {
    console.log('Client Started');
  });
}
