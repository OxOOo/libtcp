/// <reference types="node" />

import { Socket } from './socket';
import I = require('./interfaces');

export class Client extends Socket {
	constructor(public options: I.Options = {}) {
		super(options);
	}

	public connect(address: string, port: number) {
		return new Promise((resolve, reject) => {
			let connect = () => {
				resolve();
				this.removeListener('connect', connect);
				this.removeListener('error', error);
			}
			let error = (err: Error) => {
				reject(err);
				this.removeListener('connect', connect);
				this.removeListener('error', error);
			}
			this.once('connect', connect);
			this.once('error', error);
			this.state = I.SocketState.connecting;
			try {
				this._socket.connect(port, address);
			} catch (e) {
				reject(e);
			}
		});
	}
}
