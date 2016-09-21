"use strict";
exports.isBuffer = Buffer.isBuffer;
exports.isString = function (value) {
    return value instanceof String;
};
exports.isArray = Array.isArray;
exports.isObject = function (value) {
    return typeof (value) === "object" && value !== null && !exports.isArray(value);
};
