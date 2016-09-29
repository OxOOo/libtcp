/// <reference types="node" />
/// <reference types="mz" />

import mzzlib = require('mz/zlib');
import crypto = require('crypto');

export interface BaseDProcess {
	encode(buffer: Buffer): Promise<Buffer>;
	decode(buffer: Buffer): Promise<Buffer>;
}

export class ZlibDProcess implements BaseDProcess {
	constructor() {

	}
	async encode(buffer: Buffer) {
		return <Buffer>await mzzlib.deflate(buffer);
	}
	async decode(buffer: Buffer): Promise<Buffer> {
		return <Buffer>await mzzlib.unzip(buffer);
	}
}

export class CryptoDProcess implements BaseDProcess {

	constructor(private algorithm: string, private secret_key: string) {

	}
	async encode(buffer: Buffer) {
		let cipher = crypto.createCipher(this.algorithm, this.secret_key);
		let cipherChunks: Buffer[] = [];
		cipherChunks.push(cipher.update(buffer));
		cipherChunks.push(cipher.final());
		return Buffer.concat(cipherChunks);
	}
	async decode(buffer: Buffer) {
		let decipher = crypto.createDecipher(this.algorithm, this.secret_key);
		let plainChunks: Buffer[] = [];
		plainChunks.push(decipher.update(buffer));
		plainChunks.push(decipher.final());
		return Buffer.concat(plainChunks);
	}
}