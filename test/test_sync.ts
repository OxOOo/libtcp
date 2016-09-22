/// <reference types="node" />

import { Server, Client, Socket, I } from '../src';
import assert = require('assert');

export = async function (options: any) {
	let server_socket: Socket = options.server_socket;
	let server: Server = options.server;
	let client: Client = options.client;
	let utility = require('utility');

	console.log('Test Send Sync');
	let message = [1, 2, 'abcdef'];

	console.time('sendSync');
	console.log(message);

	server_socket.onSync('sendSync', (arg: any) => {
		return new Promise((resolve, reject) => {
			resolve(message);
		});
	});
	server.onSocketSync('sendSync2', (socket, arg) => {
		return new Promise((resolve, reject) => {
			resolve(message);
		});
	});

	let reply = await client.emitSync('sendSync', message);
	console.log(reply);
	assert(utility.md5(message) == utility.md5(reply));
	reply = await client.emitSync('sendSync2', message);
	console.log(reply);
	assert(utility.md5(message) == utility.md5(reply));
	console.timeEnd('sendSync');
}
