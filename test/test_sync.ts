/// <reference types="node" />

import { Server, Client, Socket, I } from '../src';
import assert = require('assert');

export = async function (options: any) {
	var server_socket: Socket = options.server_socket;
	var client: Client = options.client;
	var utility = require('utility');

	console.log('Test Send Sync');
	var message = [1, 2, 'abcdef'];

	console.time('sendSync');
	console.log(message);
	
	server_socket.onSync('sendSync', (arg: any) => {
		return new Promise((resolve, reject) => {
			resolve(message);
		});
	});
	var reply = await client.emitSync('sendSync', message);
	console.log(reply);
	assert(utility.md5(message) == utility.md5(reply));
	console.timeEnd('sendSync');
}
