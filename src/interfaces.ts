
export interface Options {
	compress?: 'zlib';
	crypto?: { // 如果使用该参数，则会使用对称加密算法对数据进行加密
		algorithm: string; // 例aes-128-ecb,通过openssl list-cipher-algorithms可以查看支持的列表
		secret_key: string;
	}
}

export interface DataPackage {
	event: string;
	arg: any;
}

export enum ReceivedDataType {
	send = 0,
	accepted,
	sendSync,
	syncReply,
	syncError
}

export interface ReceivedData {
	type: ReceivedDataType;
	index: number;
	length: number;
	event?: string;
	arg?: any;
}

export enum SocketState {
	pending = 0,
	connecting,
	connected,
	closing,
	closed
}