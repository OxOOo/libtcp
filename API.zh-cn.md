# libtcp

### 可以发送的数据

可以发送的数据可以是string,number,Buffer,boolean,null或者是他们的任意数组或对象组合。

### 框架

libtcp主要包含3个类，`Server`,`Socket`,`Client`。

`Server`是服务器类，继承自`EventEmitter`，管理`Socket`

`Socket`是套接字，继承自`EventEmitter`

`Client`是客户端类，继承自`Socket`

### API

#### Socket

成员变量：

* `options: I.Options` 表示创建`Socket`时的参数

* `id: number` 每个`Socket`的编号，`Client`的编号为0，`Server`上每个`Socket`的编号唯一

* `locals: any` 每个`Socket`的本地变量，可以储存一些变量，比如`locals.user`储存该`Socket`登录的用户

* `state: I.SocketState` 当前`Socket`的状态

构造函数：

不建议用户直接新建`Socket`，请使用`Server`和`Client`代替

成员函数：

* `address()` 地址

* `close(): void` 关闭

* `emit(event: string, arg?: any, callback?: Function): boolean;` 发送数据

* `on(event: string, listener: (arg: any) : any)` 设置接收函数，接收另一方通过`emit`发送的数据

* `emitSync(event: string, arg?: any, timeout?: number): Promise<any>;` 发送同步消息，需要另一端先调用`onSync`设置响应函数，`Promise`会等待返回结果

* `onSync(event: string, listener: (arg: any) => Promise<any>): void;` 设置同步消息的响应函数，当对方调用`emitSync`时就会调用`listener`，`listener`返回`Promise`的结果会被传输向对方

* `waitForEvent(event: string, timeout?: number): Promise<any>;` 等待，当接收到对方通过`emit`发送的消息的时候，`Promise`将收到的结果返回

#### Server

成员变量：

* `options: I.Options;` 启动参数

* `sockets: Socket[];` 当前链接的`Socket`列表

* `socketsEmitter: EventEmitter;` 接收所有套接字发送来的消息

构造函数：

* `(options?: I.Options);` options表示启动参数

成员函数：

* `listen(address: string, port: number): Promise<{}>;` 开始监听

* `address()` 监听的地址

* `close(callback?: Function): this;` 关闭

* `broadcast(event: string, arg?: any, except?: Socket[] | Socket): void;` 广播，向所有`Socket`发送信息，`except`是不发送的套接字

* `onSocketSync(event: string, listener: (socket: Socket, arg: any) => Promise<any>): void;` 设置接受套接字的同步响应函数

* `waitForEvent(event: string, timeout?: number): Promise<any>;` 等待所有套接字的信息

#### Client

成员变量：

* `options: I.Options;` 启动参数

构造函数：

* `(options?: I.Options);` options表示启动参数

成员函数：

* `connect(address: string, port: number): Promise<{}>;` 连接服务器
