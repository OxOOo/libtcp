/// <reference types="node" />

import {Server, Client, Socket, I} from '../';
const PORT = 3766;

export = function (options: I.Options) {
  return new Promise<{server: Server;client: Client;server_socket: Socket;}>(function (resolve, reject) {
    console.log('Start Server and Client');

    var server = new Server(options);
    var client = new Client(options);

    //Start Server
    server.listen("localhost", PORT, function () {
      console.log('Server Started');
    });

    server.on('connection', function (socket: Socket) {
      console.log('New Connection');
      var server_socket = socket;
      resolve({
        server: server,
        client: client,
        server_socket: server_socket
      });
    });

    //Start Client
    client.connect('localhost', PORT, function () {
      console.log('Client Started');
    });
  });
}
