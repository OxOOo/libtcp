/// <reference path="../typings/index.d.ts" />
"use strict";
const zlib = require('zlib');
class ZlibDProcess {
    constructor() {
    }
    encode(buffer) {
        return new Promise(function (resolve, reject) {
            zlib.deflate(buffer, (err, compressed) => {
                if (!err) {
                    resolve(compressed);
                }
                else {
                    reject(err);
                }
            });
        });
    }
    decode(buffer) {
        return new Promise(function (resolve, reject) {
            zlib.unzip(buffer, (err, nocompress) => {
                if (!err) {
                    resolve(nocompress);
                }
                else {
                    reject(err);
                }
            });
        });
    }
}
exports.ZlibDProcess = ZlibDProcess;
