import B = require('./buffer');
import I = require('../interfaces');
export declare var number2Buffer: typeof B.uint642Buffer;
export declare var buffer2Number: (buffer: Buffer) => {
    length: number;
    value: number;
};
export declare var dataPackage2Buffer: (data_package: I.DataPackage, index: number) => Buffer;
export declare var acceptIndex2Buffer: (index: number) => Buffer;
export declare var buffer2DataPackage: (data_buffer: Buffer, offset?: number) => I.ReceivedData;
