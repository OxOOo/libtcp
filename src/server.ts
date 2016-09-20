/// <reference path="../typings/index.d.ts" />

import net = require("net");
import events = require('events');
const EventEmitter = events.EventEmitter;
import {Socket} from './socket';
import I = require('./interfaces');

export class Server extends EventEmitter {

  public sockets: Socket[] = [];
  public socketsEmitter = new EventEmitter();

  private _server = net.createServer();
  private _sockets_id = 0;

  constructor(public options: I.Options = {}) {
    super();

    this._server.on('connection', (s) => {
      var socket = new Socket(this.options, s, ++this._sockets_id);
      this.sockets.push(socket);
      var broadcast = (event: string, arg: any) => {
        this.socketsEmitter.emit(event, socket, arg);
      }
      var remove = () => {
        this.sockets.splice(this.sockets.indexOf(socket), 1);
        this.socketsEmitter.emit('remove', socket);
      }
      socket.on('close', remove);
      socket.on("error", remove);
      socket.on(Socket.ALL_DATA_MESSAGE, broadcast);
      super.emit('connection', socket);
    });

    this._server.on('close', () => {
      super.emit('close');
    });
    this._server.on('error', (error) => {
      super.emit('error', error);
    });
    this._server.on('listening', () => {
      super.emit('listening');
    });
  }

  public listen(address: string, port: number, callback?: Function) {
    if (callback) {
      this.once('listening', callback);
    }
    this._server.listen(port, address);
  }

  public address() {
    return this._server.address();
  }

  public close(callback?: Function) {
    if (callback) {
      this.once('close', callback);
    }
    this._server.close();
    return this;
  }

  public broadcast(event: string, arg?: any, except?: Socket[] | Socket) {
    this.sockets.forEach((socket) => {
      if (except instanceof Array && except.indexOf(socket) !== -1) return;
      if (except == socket) return;
      socket.emit(event, arg);
    });
  }
}
