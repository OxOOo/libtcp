/// <reference types="node" />
export interface BaseDProcess {
    encode(buffer: Buffer): Promise<Buffer>;
    decode(buffer: Buffer): Promise<Buffer>;
}
export declare class ZlibDProcess implements BaseDProcess {
    constructor();
    encode(buffer: Buffer): Promise<Buffer>;
    decode(buffer: Buffer): Promise<Buffer>;
}
export declare class CryptoDProcess implements BaseDProcess {
    private algorithm;
    private secret_key;
    constructor(algorithm: string, secret_key: string);
    encode(buffer: Buffer): Promise<Buffer>;
    decode(buffer: Buffer): Promise<Buffer>;
}
