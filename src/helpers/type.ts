
export let isBuffer = Buffer.isBuffer;

export let isString = function (value: any) {
	return value instanceof String;
}

export let isArray = Array.isArray;

export let isObject = function (value: any) {
	return typeof (value) === "object" && value !== null && !isArray(value);
}
