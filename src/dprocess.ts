/// <reference types="node" />

import zlib = require('zlib');
import crypto = require('crypto');

export interface BaseDProcess {
	encode(buffer: Buffer): Promise<Buffer>;
	decode(buffer: Buffer): Promise<Buffer>;
}

export class ZlibDProcess implements BaseDProcess {
	constructor() {

	}
	encode(buffer: Buffer): Promise<Buffer> {
		return new Promise<Buffer>((resolve, reject) => {
			zlib.deflate(buffer, (err, compressed) => {
				if (!err) {
					resolve(compressed);
				} else {
					reject(err);
				}
			});
		});
	}
	decode(buffer: Buffer): Promise<Buffer> {
		return new Promise<Buffer>((resolve, reject) => {
			zlib.unzip(buffer, (err, nocompress) => {
				if (!err) {
					resolve(nocompress);
				} else {
					reject(err);
				}
			});
		});
	}
}

export class CryptoDProcess implements BaseDProcess {

	constructor(private algorithm: string, private secret_key: string) {

	}
	encode(buffer: Buffer): Promise<Buffer> {
		var cipher = crypto.createCipher(this.algorithm, this.secret_key);
		return new Promise<Buffer>((resolve, reject) => {
			var cipherChunks: Buffer[] = [];
			cipherChunks.push(cipher.update(buffer));
			cipherChunks.push(cipher.final());
			resolve(Buffer.concat(cipherChunks));
		});
	}
	decode(buffer: Buffer): Promise<Buffer> {
		var decipher = crypto.createDecipher(this.algorithm, this.secret_key);
		return new Promise<Buffer>((resolve, reject) => {
			var plainChunks: Buffer[] = [];
			plainChunks.push(decipher.update(buffer));
			plainChunks.push(decipher.final());
			resolve(Buffer.concat(plainChunks));
		});
	}
}