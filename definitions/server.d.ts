/// <reference path="../typings/index.d.ts" />
import { EventEmitter } from 'events';
import { Socket } from './socket';
import I = require('./interfaces');
export declare class Server extends EventEmitter {
    options: I.Options;
    sockets: Socket[];
    socketsEmitter: EventEmitter;
    private _server;
    private _sockets_id;
    constructor(options?: I.Options);
    listen(address: string, port: number, callback?: Function): void;
    address(): {
        port: number;
        family: string;
        address: string;
    };
    close(callback?: Function): this;
    broadcast(event: string, arg?: any, except?: Socket[] | Socket): void;
}
