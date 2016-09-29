/// <reference types="node" />
import { EventEmitter } from 'events';
import { Socket } from './socket';
import I = require('./interfaces');
export declare class Server extends EventEmitter {
    options: I.Options;
    sockets: Socket[];
    socketsEmitter: EventEmitter;
    private _server;
    private _sockets_id;
    private _sync_callbacks;
    private _pending_event_callbacks;
    private _timeouts;
    private _timeouts_handle;
    constructor(options?: I.Options);
    listen(address: string, port: number): Promise<{}>;
    address(): {
        port: number;
        family: string;
        address: string;
    };
    close(callback?: Function): this;
    broadcast(event: string, arg?: any, except?: Socket[] | Socket): void;
    onSocketSync(event: string, listener: (socket: Socket, arg: any) => Promise<any>): void;
    waitForEvent(event: string, timeout?: number): Promise<any>;
    private _registerTimeout(event, clock);
    private _buildTimeout();
}
