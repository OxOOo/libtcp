"use strict";
const POW32 = Math.pow(2, 32);
const ALLOW_LENGTH_LIST = [1, 2, 4, 8];
function writeNumber(value, opt = { length: 8 }) {
    let length = opt.length;
    if (value < 0)
        throw new Error('value should be greater or equal to 0');
    if (ALLOW_LENGTH_LIST.indexOf(length) == -1)
        throw new Error('length must be [' + ALLOW_LENGTH_LIST.join(',') + ']');
    let buffer = new Buffer(length);
    if (length === 1) {
        buffer.writeUInt8(value, 0);
    }
    else if (length === 2) {
        buffer.writeUInt16BE(value, 0);
    }
    else if (length === 4) {
        buffer.writeUInt32BE(value, 0);
    }
    else if (length === 8) {
        buffer.writeUInt32BE(value % POW32, 0);
        buffer.writeUInt32BE(Math.floor(value / POW32), 4);
    }
    return buffer;
}
function readNumber(buffer, opt = { offset: 0, length: 8 }) {
    let length = opt.length;
    let offset = opt.offset;
    if (ALLOW_LENGTH_LIST.indexOf(length) == -1)
        throw new Error('length must be [' + ALLOW_LENGTH_LIST.join(',') + ']');
    let value = 0;
    if (length === 1) {
        value = buffer.readInt8(offset);
    }
    else if (length === 2) {
        value = buffer.readInt16BE(offset);
    }
    else if (length === 4) {
        value = buffer.readInt32BE(offset);
    }
    else if (length === 8) {
        value = buffer.readInt32BE(offset);
        value = value + buffer.readInt32BE(4 + offset) * POW32;
    }
    return value;
}
function number2Buffer(value, length = 8) {
    let length_buffer = writeNumber(length, { length: 1 });
    let data_buffer = writeNumber(value, { length: length });
    return Buffer.concat([length_buffer, data_buffer]);
}
exports.number2Buffer = number2Buffer;
function buffer2Number(buffer, offset = 0) {
    if (buffer.length < offset + 1)
        return null;
    let length = readNumber(buffer, { offset: offset, length: 1 });
    if (ALLOW_LENGTH_LIST.indexOf(length) === -1) {
        throw new Error('wrong data buffer');
    }
    if (buffer.length < offset + length + 1)
        return null;
    let value = readNumber(buffer, { length: length, offset: offset + 1 });
    return {
        length: length + 1,
        value: value
    };
}
exports.buffer2Number = buffer2Number;
function string2Buffer(value) {
    let string_buffer = new Buffer(value);
    let length_buffer = number2Buffer(string_buffer.length);
    return Buffer.concat([length_buffer, string_buffer]);
}
exports.string2Buffer = string2Buffer;
function buffer2String(buffer, offset = 0) {
    let length_data = buffer2Number(buffer, offset);
    if (!length_data)
        return null;
    if (buffer.length < offset + length_data.length + length_data.value)
        return null;
    let string_buffer = buffer.slice(offset + length_data.length, offset + length_data.length + length_data.value);
    return {
        length: length_data.length + string_buffer.length,
        value: string_buffer.toString()
    };
}
exports.buffer2String = buffer2String;
function buffer2Buffer(value) {
    let buffer_buffer = value.slice();
    let length_buffer = number2Buffer(buffer_buffer.length);
    return Buffer.concat([length_buffer, buffer_buffer]);
}
exports.buffer2Buffer = buffer2Buffer;
function bufferFromBuffer(buffer, offset = 0) {
    let length_data = buffer2Number(buffer, offset);
    if (!length_data)
        return null;
    if (buffer.length < offset + length_data.length + length_data.value)
        return null;
    let buffer_buffer = buffer.slice(offset + length_data.length, offset + length_data.length + length_data.value);
    return {
        length: length_data.length + buffer_buffer.length,
        value: buffer_buffer
    };
}
exports.bufferFromBuffer = bufferFromBuffer;
function uint82Buffer(value) {
    return number2Buffer(value, 1);
}
exports.uint82Buffer = uint82Buffer;
function uint162Buffer(value) {
    return number2Buffer(value, 2);
}
exports.uint162Buffer = uint162Buffer;
function uint322Buffer(value) {
    return number2Buffer(value, 4);
}
exports.uint322Buffer = uint322Buffer;
function uint642Buffer(value) {
    return number2Buffer(value, 8);
}
exports.uint642Buffer = uint642Buffer;
