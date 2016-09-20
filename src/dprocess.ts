/// <reference path="../typings/index.d.ts" />

import zlib = require('zlib');

export interface BaseDProcess {
	encode(buffer: Buffer): Promise<Buffer>;
	decode(buffer: Buffer): Promise<Buffer>;
}

export class ZlibDProcess implements BaseDProcess {
	constructor() {

	}
	encode(buffer: Buffer): Promise<Buffer> {
		return new Promise<Buffer>(function (resolve, reject) {
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
		return new Promise<Buffer>(function (resolve, reject) {
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