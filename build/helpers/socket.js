"use strict";
const B = require("./buffer");
const T = require("./type");
const I = require("../interfaces");
var TYPE;
(function (TYPE) {
    TYPE[TYPE["JSON"] = 1] = "JSON";
    TYPE[TYPE["BUFFER"] = 2] = "BUFFER";
    TYPE[TYPE["STRING"] = 3] = "STRING";
    TYPE[TYPE["OBJECT"] = 4] = "OBJECT";
    TYPE[TYPE["ARRAY"] = 5] = "ARRAY";
})(TYPE || (TYPE = {}));
;
/// 将参数转化为Buffer
let arg2Buffer = function (arg) {
    let type_buffer = null;
    let arg_buffer = null;
    if (T.isBuffer(arg)) {
        // buffer
        type_buffer = B.uint82Buffer(TYPE.BUFFER);
        arg_buffer = B.buffer2Buffer(arg);
    }
    else if (T.isString(arg)) {
        // string
        type_buffer = B.uint82Buffer(TYPE.STRING);
        arg_buffer = B.string2Buffer(arg);
    }
    else if (T.isObject(arg)) {
        // object
        // type | property number | property list
        type_buffer = B.uint82Buffer(TYPE.OBJECT);
        let property_list = [];
        Object.keys(arg).forEach((key) => {
            if (arg.hasOwnProperty(key)) {
                let key_buffer = B.string2Buffer(key);
                let property_buffer = arg2Buffer(arg[key]);
                if (property_buffer) {
                    property_list.push(key_buffer);
                    property_list.push(property_buffer);
                }
            }
        });
        property_list.unshift(B.number2Buffer(property_list.length / 2));
        arg_buffer = Buffer.concat(property_list);
    }
    else if (T.isArray(arg)) {
        // array
        // type | array number | value list
        type_buffer = B.uint82Buffer(TYPE.ARRAY);
        let value_list = [];
        arg.forEach(function (value) {
            let value_buffer = arg2Buffer(value);
            if (value_buffer) {
                value_list.push(value_buffer);
            }
        });
        value_list.unshift(B.number2Buffer(value_list.length));
        arg_buffer = Buffer.concat(value_list);
    }
    else {
        // others
        let serialized_data = JSON.stringify(arg);
        if (!serialized_data)
            return null;
        type_buffer = B.uint82Buffer(TYPE.JSON);
        arg_buffer = B.string2Buffer(serialized_data);
    }
    return Buffer.concat([type_buffer, arg_buffer]);
};
// 将Buffer转化为参数，要求Buffer一定是完整的
let buffer2Arg = function (data_buffer, offset) {
    let type_data = B.buffer2Number(data_buffer, offset);
    if (!type_data)
        return null;
    let value = null;
    let s_offset = offset;
    offset = s_offset + type_data.length;
    if (type_data.value === TYPE.BUFFER) {
        let buffer_data = B.bufferFromBuffer(data_buffer, offset);
        value = buffer_data.value;
        offset += buffer_data.length;
    }
    else if (type_data.value === TYPE.STRING) {
        let string_data = B.buffer2String(data_buffer, offset);
        value = string_data.value;
        offset += string_data.length;
    }
    else if (type_data.value === TYPE.JSON) {
        let string_data = B.buffer2String(data_buffer, offset);
        value = JSON.parse(string_data.value);
        offset += string_data.length;
    }
    else if (type_data.value === TYPE.OBJECT) {
        // object
        // type | property number | property list
        let property_number_data = B.buffer2Number(data_buffer, offset);
        let property_number = property_number_data.value;
        offset += property_number_data.length;
        value = {};
        for (let i = 0; i < property_number; i++) {
            let key_data = B.buffer2String(data_buffer, offset);
            offset += key_data.length;
            let property_data = buffer2Arg(data_buffer, offset);
            offset += property_data.length;
            value[key_data.value] = property_data.value;
        }
    }
    else if (type_data.value === TYPE.ARRAY) {
        // array
        // type | array number | value list
        let array_number_data = B.buffer2Number(data_buffer, offset);
        let array_number = array_number_data.value;
        offset += array_number_data.length;
        value = [];
        for (let i = 0; i < array_number; i++) {
            let value_data = buffer2Arg(data_buffer, offset);
            offset += value_data.length;
            value.push(value_data.value);
        }
    }
    else
        throw new Error('wrong data');
    return {
        value: value,
        length: offset - s_offset
    };
};
exports.number2Buffer = B.uint642Buffer;
exports.buffer2Number = function (buffer) {
    return B.buffer2Number(buffer);
};
// send buffer : HEAD_SEND number|index Number|event String|arg Buffer
// accepted buffer : HEAD_ACCEPTED number|index Number
/// 将data_package封装为Buffer
const TYPE_HEADS = [I.ReceivedDataType.send, I.ReceivedDataType.sendSync, I.ReceivedDataType.syncReply, I.ReceivedDataType.syncError];
exports.dataPackage2Buffer = function (type, data_package, index) {
    if (TYPE_HEADS.indexOf(type) == -1) {
        throw new Error('nonsupport type ' + I.ReceivedDataType[type]);
    }
    let head_buffer = B.uint82Buffer(type);
    let index_buffer = B.number2Buffer(index);
    let event_buffer = B.string2Buffer(data_package.event);
    let arg_buffer = arg2Buffer(data_package.arg);
    if (arg_buffer == null)
        throw new TypeError('illegal arg type : ' + typeof (data_package.arg));
    return Buffer.concat([head_buffer, index_buffer, event_buffer, arg_buffer]);
};
/// 将index封装为Buffer
exports.acceptIndex2Buffer = function (index) {
    let head_buffer = B.uint82Buffer(I.ReceivedDataType.accepted);
    let index_buffer = B.number2Buffer(index);
    return Buffer.concat([head_buffer, index_buffer]);
};
/// 将Buffer转换为data_package，要求Buffer要完整
exports.buffer2DataPackage = function (data_buffer, offset = 0) {
    let head_data = B.buffer2Number(data_buffer, offset);
    if (TYPE_HEADS.indexOf(head_data.value) != -1) {
        let index_data = B.buffer2Number(data_buffer, offset + head_data.length);
        let event_data = B.buffer2String(data_buffer, offset + head_data.length + index_data.length);
        let arg_data = buffer2Arg(data_buffer, offset + head_data.length + index_data.length + event_data.length);
        return {
            type: head_data.value,
            event: event_data.value,
            arg: arg_data.value,
            index: index_data.value,
            length: head_data.length + index_data.length + event_data.length + arg_data.length
        };
    }
    else if (head_data.value == I.ReceivedDataType.accepted) {
        let index_data = B.buffer2Number(data_buffer, offset + head_data.length);
        return {
            type: I.ReceivedDataType.accepted,
            index: index_data.value,
            length: head_data.length + index_data.length
        };
    }
    else
        throw new Error('wrong data');
};
