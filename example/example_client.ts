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
