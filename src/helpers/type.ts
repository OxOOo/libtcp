/// <reference path="../../typings/index.d.ts" />

export var isBuffer = Buffer.isBuffer;

export var isString = function (value: any) {
	return value instanceof String;
}

export var isArray = Array.isArray;

export var isObject = function (value: any) {
	return typeof (value) === "object" && value !== null && !isArray(value);
}
