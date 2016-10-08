# libtcp

## example

server.js:

```typescript
import { Server, Socket } from '../';

let PORT = 3766;

async function run() {
	let server = new Server();
	server.on('connection', function (socket: Socket) {
		console.log('[Server]New Connection');

		socket.on('message', function (message: any) {
			console.log(message);
			// message will be 2
		});
		socket.onSync('sync', function (message: any) {
			return new Promise((resolve, reject) => {
				setTimeout(resolve.bind(resolve, 'Hello'), 1000);
			});
		});

		socket.emit('sendString', 'hello world');

		socket.emit('sendObject', {
			message: '123',
			count: 23
		});

		let buffer = new Buffer(4);
		buffer.writeUInt32BE(0x1234, 0);
		socket.emit('sendBuffer', buffer);
	});

	await server.listen("localhost", PORT);
	console.log('Server Started');
}

run();
```

client.js:
```typescript
import { Client } from '../';

let PORT = 3766;

async function run() {
	let client = new Client();

	client.connect('localhost', PORT);

	client.emit('message', 2);

	client.on('sendString', function (message: any) {
		console.log(message);
		// message will be 'hello world'
	});

	client.on('sendObject', function (message: any) {
		console.log('message');
		// message will be {message: '123', count: 23}
	});

	client.on('sendBuffer', function (message: any) {
		console.log(message);
		// message will be <Buffer 00 00 12 34>
	});

	let ret = await client.emitSync('sync');
	console.log(ret);
	// ret will be 'hello'
	
	client.close();
}

run();
```

## API

[中文](API.zh-cn.md)