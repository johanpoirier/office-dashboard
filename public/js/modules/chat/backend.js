var config, iosockets;
var usernames = [];

exports.withConfig = function (cfg) {
    console.log("[chat] module loaded");
    config = cfg;
    return this;
}

exports.start = function (socketio) {
    iosockets = socketio;

    iosockets.on('connection', function (socket) {
        var _username;
        socket.on("chat:message", function (message) {
            iosockets.emit("chat:dispatch", "[" + socket.username + "] " + message);
            console.log("[chat] dispatching new message from " + socket.username + " : " + message);
        });

        socket.on('chat:adduser', function (username) {
            // we store the username in the socket session for this client
            socket.username = username;
            usernames.push(username);
            iosockets.emit("chat:users", usernames);
            console.log("[chat] new user " + username);
        });

        socket.on('disconnect', function () {
            if (socket.username) {
                // remove the username from global usernames list
                usernames = usernames.filter(function(username) {
                    return socket.username !== username;
                });

                // update list of users in chat, client-side
                iosockets.emit('chat:users', usernames);

                console.log("[chat] user " + socket.username + " just left");
            }
        });
    });
}