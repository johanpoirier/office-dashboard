var config, socket;

exports.withConfig = function(cfg) {
    console.log("Chat module loaded");
    config = cfg;
    return this;
}

exports.start = function(socketio) {
    socket = socketio;
    socket.on("chat:message", dispatchMessage.bind(this));
}

var dispatchMessage = function(message) {
    socket.emit("chat:dispatch", message);
}