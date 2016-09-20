/// <reference path="../../typings/index.d.ts" />

import B = require('./buffer');
import T = require('./type');
import I = require('../interfaces');

enum TYPE {
  JSON = 1,
  BUFFER = 2,
  STRING = 3,
  OBJECT = 4,
  ARRAY = 5
};

/// 将参数转化为Buffer
var arg2Buffer = function (arg: any) {
  var type_buffer: Buffer = null;
  var arg_buffer: Buffer = null;

  if (T.isBuffer(arg)) {
    // buffer
    type_buffer = B.uint82Buffer(TYPE.BUFFER);
    arg_buffer = B.buffer2Buffer(arg);
  } else if (T.isString(arg)) {
    // string
    type_buffer = B.uint82Buffer(TYPE.STRING);
    arg_buffer = B.string2Buffer(arg);
  } else if (T.isObject(arg)) {
    // object
    // type | property number | property list
    type_buffer = B.uint82Buffer(TYPE.OBJECT);
    var property_list: Buffer[] = [];
    Object.keys(arg).forEach((key) => {
      if (arg.hasOwnProperty(key)) {
        var key_buffer = B.string2Buffer(key);
        var property_buffer = arg2Buffer(arg[key]);
        if (property_buffer) {
          property_list.push(key_buffer);
          property_list.push(property_buffer);
        }
      }
    });
    property_list.unshift(B.number2Buffer(property_list.length / 2));
    arg_buffer = Buffer.concat(property_list);
  } else if (T.isArray(arg)) {
    // array
    // type | array number | value list
    type_buffer = B.uint82Buffer(TYPE.ARRAY);
    var value_list: Buffer[] = [];
    arg.forEach(function (value) {
      var value_buffer = arg2Buffer(value);
      if (value_buffer) {
        value_list.push(value_buffer);
      }
    });
    value_list.unshift(B.number2Buffer(value_list.length));
    arg_buffer = Buffer.concat(value_list);
  } else {
    // others
    var serialized_data = JSON.stringify(arg);
    if (!serialized_data) return null;
    type_buffer = B.uint82Buffer(TYPE.JSON);
    arg_buffer = B.string2Buffer(serialized_data);
  }

  return Buffer.concat([type_buffer, arg_buffer]);
}

// 将Buffer转化为参数，要求Buffer一定是完整的
var buffer2Arg = function (data_buffer: Buffer, offset: number) {
  var type_data = B.buffer2Number(data_buffer, offset);
  if (!type_data) return null;

  var value: any = null;
  var s_offset = offset;
  var offset = s_offset + type_data.length;

  if (type_data.value === TYPE.BUFFER) {
    var buffer_data = B.bufferFromBuffer(data_buffer, offset);
    value = buffer_data.value;
    offset += buffer_data.length;
  } else if (type_data.value === TYPE.STRING) {
    var string_data = B.buffer2String(data_buffer, offset);
    value = string_data.value;
    offset += string_data.length;
  } else if (type_data.value === TYPE.JSON) {
    var string_data = B.buffer2String(data_buffer, offset);
    value = JSON.parse(string_data.value);
    offset += string_data.length;
  } else if (type_data.value === TYPE.OBJECT) {
    // object
    // type | property number | property list
    var property_number_data = B.buffer2Number(data_buffer, offset);
    var property_number = property_number_data.value;
    offset += property_number_data.length;
    value = {};
    for (var i = 0; i < property_number; i++) {
      var key_data = B.buffer2String(data_buffer, offset);
      offset += key_data.length;
      var property_data = buffer2Arg(data_buffer, offset);
      offset += property_data.length;
      value[key_data.value] = property_data.value;
    }
  } else if (type_data.value === TYPE.ARRAY) {
    // array
    // type | array number | value list
    var array_number_data = B.buffer2Number(data_buffer, offset);
    var array_number = array_number_data.value;
    offset += array_number_data.length;
    value = [];
    for (var i = 0; i < array_number; i++) {
      var value_data = buffer2Arg(data_buffer, offset);
      offset += value_data.length;
      value.push(value_data.value);
    }
  } else throw new Error('wrong data');

  return {
    value: value,
    length: offset - s_offset
  }
}

enum HEAD {
  SEND = 1,
  ACCEPTED = 2
};

export var number2Buffer = B.uint642Buffer;
export var buffer2Number = function (buffer: Buffer) {
  return B.buffer2Number(buffer)
}

// send buffer : HEAD_SEND number|index Number|event String|arg Buffer
// accepted buffer : HEAD_ACCEPTED number|index Number

/// 将data_package封装为Buffer
export var dataPackage2Buffer = function (data_package: I.DataPackage, index: number) {
  var head_buffer = B.uint82Buffer(HEAD.SEND);
  var index_buffer = B.number2Buffer(index);
  var event_buffer = B.string2Buffer(data_package.event);
  var arg_buffer = arg2Buffer(data_package.arg);
  if (arg_buffer == null) throw new TypeError('illegal arg type : ' + typeof (data_package.arg));
  return Buffer.concat([head_buffer, index_buffer, event_buffer, arg_buffer]);
}

/// 将index封装为Buffer
export var acceptIndex2Buffer = function (index: number) {
  var head_buffer = B.uint82Buffer(HEAD.ACCEPTED);
  var index_buffer = B.number2Buffer(index);
  return Buffer.concat([head_buffer, index_buffer]);
}

/// 将Buffer转换为data_package，要求Buffer要完整
export var buffer2DataPackage = function (data_buffer: Buffer, offset = 0): I.ReceivedData {
  var head_data = B.buffer2Number(data_buffer, offset);

  if (head_data.value == HEAD.SEND) {
    var index_data = B.buffer2Number(data_buffer, offset + head_data.length);
    var event_data = B.buffer2String(data_buffer, offset + head_data.length + index_data.length);
    var arg_data = buffer2Arg(data_buffer, offset + head_data.length + index_data.length + event_data.length);
    return {
      type: I.ReceivedDataType.send,
      event: event_data.value,
      arg: arg_data.value,
      index: index_data.value,
      length: head_data.length + index_data.length + event_data.length + arg_data.length
    }

  } else if (head_data.value == HEAD.ACCEPTED) {
    var index_data = B.buffer2Number(data_buffer, offset + head_data.length);
    return {
      type: I.ReceivedDataType.accepted,
      index: index_data.value,
      length: head_data.length + index_data.length
    }

  } else throw new Error('wrong data');
}
