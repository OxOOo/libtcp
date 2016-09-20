/// <reference path="../../typings/index.d.ts" />

const POW32 = Math.pow(2, 32);
const ALLOW_LENGTH_LIST = [1, 2, 4, 8];
function writeNumber(value: number, opt = { length: 8 }) {
  var length = opt.length;
  if (value < 0)
    throw new Error('value should be greater or equal to 0');
  if (ALLOW_LENGTH_LIST.indexOf(length) == -1)
    throw new Error('length must be [' + ALLOW_LENGTH_LIST.join(',') + ']');

  var buffer = new Buffer(length);
  if (length === 1) {
    buffer.writeUInt8(value, 0);
  } else if (length === 2) {
    buffer.writeUInt16BE(value, 0);
  } else if (length === 4) {
    buffer.writeUInt32BE(value, 0);
  } else if (length === 8) {
    buffer.writeUInt32BE(value % POW32, 0);
    buffer.writeUInt32BE(Math.floor(value / POW32), 4);
  }
  return buffer;
}
function readNumber(buffer: Buffer, opt = { offset: 0, length: 8 }) {
  var length = opt.length;
  var offset = opt.offset;
  if (ALLOW_LENGTH_LIST.indexOf(length) == -1)
    throw new Error('length must be [' + ALLOW_LENGTH_LIST.join(',') + ']');

  var value = 0;
  if (length === 1) {
    value = buffer.readInt8(offset);
  } else if (length === 2) {
    value = buffer.readInt16BE(offset);
  } else if (length === 4) {
    value = buffer.readInt32BE(offset);
  } else if (length === 8) {
    value = buffer.readInt32BE(offset);
    value = value + buffer.readInt32BE(4 + offset) * POW32;
  }
  return value;
}

export function number2Buffer(value: number, length = 8) {
  var length_buffer = writeNumber(length, { length: 1 });
  var data_buffer = writeNumber(value, { length: length });
  return Buffer.concat([length_buffer, data_buffer]);
}
export function buffer2Number(buffer: Buffer, offset = 0) {
  if (buffer.length < offset + 1) return null;
  var length = readNumber(buffer, { offset: offset, length: 1 });
  if (ALLOW_LENGTH_LIST.indexOf(length) === -1) {
    throw new Error('wrong data buffer');
  }
  if (buffer.length < offset + length + 1) return null;

  var value = readNumber(buffer, { length: length, offset: offset + 1 });
  return {
    length: length + 1,
    value: value
  }
}

export function string2Buffer(value: string) {
  var string_buffer = new Buffer(value);
  var length_buffer = number2Buffer(string_buffer.length);
  return Buffer.concat([length_buffer, string_buffer]);
}
export function buffer2String(buffer: Buffer, offset = 0) {
  var length_data = buffer2Number(buffer, offset);
  if (!length_data) return null;
  if (buffer.length < offset + length_data.length + length_data.value) return null;
  var string_buffer = buffer.slice(offset + length_data.length, offset + length_data.length + length_data.value);
  return {
    length: length_data.length + string_buffer.length,
    value: string_buffer.toString()
  }
}

export function buffer2Buffer(value: Buffer) {
  var buffer_buffer = value.slice();
  var length_buffer = number2Buffer(buffer_buffer.length);
  return Buffer.concat([length_buffer, buffer_buffer]);
}
export function bufferFromBuffer(buffer: Buffer, offset = 0) {
  var length_data = buffer2Number(buffer, offset);
  if (!length_data) return null;
  if (buffer.length < offset + length_data.length + length_data.value) return null;
  var buffer_buffer = buffer.slice(offset + length_data.length, offset + length_data.length + length_data.value);
  return {
    length: length_data.length + buffer_buffer.length,
    value: buffer_buffer
  }
}

export function uint82Buffer(value: number) {
  return number2Buffer(value, 1);
}

export function uint162Buffer(value: number) {
  return number2Buffer(value, 2);
}

export function uint322Buffer(value: number) {
  return number2Buffer(value, 4);
}

export function uint642Buffer(value: number) {
  return number2Buffer(value, 8);
}
