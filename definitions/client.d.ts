import { Socket } from './socket';
import I = require('./interfaces');
export declare class Client extends Socket {
    options: I.Options;
    constructor(options?: I.Options);
    connect(address: string, port: number): Promise<{}>;
}
