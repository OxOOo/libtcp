"use strict";
(function (ReceivedDataType) {
    ReceivedDataType[ReceivedDataType["send"] = 0] = "send";
    ReceivedDataType[ReceivedDataType["accepted"] = 1] = "accepted";
    ReceivedDataType[ReceivedDataType["sendSync"] = 2] = "sendSync";
    ReceivedDataType[ReceivedDataType["syncReply"] = 3] = "syncReply";
    ReceivedDataType[ReceivedDataType["syncError"] = 4] = "syncError";
})(exports.ReceivedDataType || (exports.ReceivedDataType = {}));
var ReceivedDataType = exports.ReceivedDataType;
(function (SocketState) {
    SocketState[SocketState["pending"] = 0] = "pending";
    SocketState[SocketState["connecting"] = 1] = "connecting";
    SocketState[SocketState["connected"] = 2] = "connected";
    SocketState[SocketState["closing"] = 3] = "closing";
    SocketState[SocketState["closed"] = 4] = "closed";
})(exports.SocketState || (exports.SocketState = {}));
var SocketState = exports.SocketState;
