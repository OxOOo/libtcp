export declare function number2Buffer(value: number, length?: number): Buffer;
export declare function buffer2Number(buffer: Buffer, offset?: number): {
    length: number;
    value: number;
};
export declare function string2Buffer(value: string): Buffer;
export declare function buffer2String(buffer: Buffer, offset?: number): {
    length: number;
    value: string;
};
export declare function buffer2Buffer(value: Buffer): Buffer;
export declare function bufferFromBuffer(buffer: Buffer, offset?: number): {
    length: number;
    value: Buffer;
};
export declare function uint82Buffer(value: number): Buffer;
export declare function uint162Buffer(value: number): Buffer;
export declare function uint322Buffer(value: number): Buffer;
export declare function uint642Buffer(value: number): Buffer;
