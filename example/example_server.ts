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
