/// <reference types="node" />
import B = require('./buffer');
import I = require('../interfaces');
export declare let number2Buffer: typeof B.uint642Buffer;
export declare let buffer2Number: (buffer: Buffer) => {
    length: number;
    value: number;
};
export declare let dataPackage2Buffer: (type: I.ReceivedDataType, data_package: I.DataPackage, index: number) => Buffer;
export declare let acceptIndex2Buffer: (index: number) => Buffer;
export declare let buffer2DataPackage: (data_buffer: Buffer, offset?: number) => I.ReceivedData;
