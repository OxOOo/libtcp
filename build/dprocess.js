/// <reference types="node" />
"use strict";
const zlib = require("zlib");
const crypto = require("crypto");
class ZlibDProcess {
    constructor() {
    }
    encode(buffer) {
        return new Promise((resolve, reject) => {
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
        return new Promise((resolve, reject) => {
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
class CryptoDProcess {
    constructor(algorithm, secret_key) {
        this.algorithm = algorithm;
        this.secret_key = secret_key;
    }
    encode(buffer) {
        let cipher = crypto.createCipher(this.algorithm, this.secret_key);
        return new Promise((resolve, reject) => {
            let cipherChunks = [];
            cipherChunks.push(cipher.update(buffer));
            cipherChunks.push(cipher.final());
            resolve(Buffer.concat(cipherChunks));
        });
    }
    decode(buffer) {
        let decipher = crypto.createDecipher(this.algorithm, this.secret_key);
        return new Promise((resolve, reject) => {
            let plainChunks = [];
            plainChunks.push(decipher.update(buffer));
            plainChunks.push(decipher.final());
            resolve(Buffer.concat(plainChunks));
        });
    }
}
exports.CryptoDProcess = CryptoDProcess;
