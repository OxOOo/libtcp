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

	console.log('Test Wait');

	console.time('sendWait');

	server.waitForEvent('sendWait').then(arg => {
		console.log(arg);
	});
	client.emit('sendWait', 'hahaha');

	console.timeEnd('sendWait');
	await sleep(100);
}
