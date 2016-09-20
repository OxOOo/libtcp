/// <reference path="../typings/index.d.ts" />

export interface Options
{
	compress?: string;
}

export interface DataPackage
{
	event: string;
	arg: any;
}

export enum ReceivedDataType {
	send = 0,
	accepted
}

export interface ReceivedData
{
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