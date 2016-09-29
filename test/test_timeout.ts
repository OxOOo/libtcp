/// <reference types="node" />

import { Server, Client, Socket, I } from '../src';
import assert = require('assert');

async function sleep(ms: number) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, ms);
	})
}

export = async function (options: any) {
	let server_socket: Socket = options.server_socket;
	let server: Server = options.server;
	let client: Client = options.client;
	let utility = require('utility');

	console.log('Test Timeout');

	console.time('sendTimeout');

	try {
		await server.waitForEvent('sendTimeout', 10);
	} catch(e) {
		console.log(e);
	}
	try {
		await client.waitForEvent('sendTimeout', 10);
	} catch(e) {
		console.log(e);
	}
	
	console.timeEnd('sendTimeout');
}
