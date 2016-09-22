let Client = require('../index').Client;

let PORT = 3766;
let options = {
  // compress: 'zlib',
}

let client = new Client(options);
client.connect(PORT, 'localhost', function() {
  console.log('Client Connected');
  client.emit('message', 2);
});

client.on('sendString', function(message) {
  console.log(message);
  // message will be ‘hello world’
});

client.on('sendObject', function(message) {
  console.log('message');
  // message will be {message: '123', count: 23}
});

client.on('sendBuffer', function(message) {
  console.log(message);
  // message will be <Buffer 00 00 12 34>
});

client.on('endSend', function(message) {
  console.log(message);
  // message will be {}
  client.close(function() {
    console.log('Client Closed');
  });
});
