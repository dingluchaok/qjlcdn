/**
 * Created by Will on 2018-01-05.
 */

var socket = {};
socket.callbacks = new Array();
socket.init = function(callback, wsUri, onReady)
{
    socket.onReady = onReady;
    socket.webSocket = new WebSocket(wsUri);
    socket.webSocket.onopen = function(e) {
        socket.onOpen(e)
    };
    socket.webSocket.onclose = function(e) {
        socket.onClose(e)
    };
    socket.webSocket.onmessage = function(e) {
        socket.onMessage(e)
    };
    socket.webSocket.onerror = function(e) {
        socket.onError(e)
    };
    socket.callback = callback;
};

socket.onOpen = function(e)
{
    if(socket.onReady)
    {
        socket.onReady();
    }
    socket.send("remove");
};

socket.onClose = function(e)
{

};

socket.onError = function(e)
{
    var error = e.data;
    socket.callback(error);
};

socket.onMessage = function(e)
{
    console.log(e.data);
    var message = e.data;
    if(message.indexOf("callback") == -1)
    {
        socket.callback(message);
    }
    else
    {
        var strs = message.split("|");
        var data = strs[1];
        var callback = socket.callbacks.shift();
        callback(data);
    }
};

socket.send = function(message, callback)
{
    if(callback)
    {
        socket.callbacks.push(callback);
    }
    socket.webSocket.send(message);
};

