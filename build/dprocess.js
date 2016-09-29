/// <reference types="node" />
/// <reference types="mz" />
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const mzzlib = require("mz/zlib");
const crypto = require("crypto");
class ZlibDProcess {
    constructor() {
    }
    encode(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield mzzlib.deflate(buffer);
        });
    }
    decode(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield mzzlib.unzip(buffer);
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
        return __awaiter(this, void 0, void 0, function* () {
            let cipher = crypto.createCipher(this.algorithm, this.secret_key);
            let cipherChunks = [];
            cipherChunks.push(cipher.update(buffer));
            cipherChunks.push(cipher.final());
            return Buffer.concat(cipherChunks);
        });
    }
    decode(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            let decipher = crypto.createDecipher(this.algorithm, this.secret_key);
            let plainChunks = [];
            plainChunks.push(decipher.update(buffer));
            plainChunks.push(decipher.final());
            return Buffer.concat(plainChunks);
        });
    }
}
exports.CryptoDProcess = CryptoDProcess;
