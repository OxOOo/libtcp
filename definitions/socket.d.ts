/// <reference types="node" />
import net = require("net");
import { EventEmitter } from 'events';
import I = require('./interfaces');
export declare class Socket extends EventEmitter {
    options: I.Options;
    protected _socket: net.Socket;
    id: number;
    static DATA_DELAY: number;
    static ALL_DATA_MESSAGE: string;
    locals: Object;
    state: I.SocketState;
    private _pending_data_chunks;
    private _received_data;
    private _index;
    private static _INDEX_MOD;
    private _dprocesses;
    private _time_handle;
    private _pending_callbacks;
    constructor(options: I.Options, _socket?: net.Socket, id?: number);
    address(): {
        port: number;
        family: string;
        address: string;
    };
    close(): void;
    emit(event: string, arg: any, callback?: Function): boolean;
    private _encode(buffer);
    private _decode(buffer);
    private _sendDataPackage(data_package, index, callback?);
    private _sendAccepted(index);
    private _receive();
}
