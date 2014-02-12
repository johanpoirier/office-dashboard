var config, iosockets;
var messages = [], usernames = [];

exports.withConfig = function (cfg) {
    console.log("[chat] module loaded");
    config = cfg;
    return this;
}

exports.start = function (socketio) {
    iosockets = socketio;

    iosockets.on('connection', function (socket) {
        socket.on("chat:message", function (content) {
            var message = { "author": socket.username , "content": content };
            messages.push(message);
            if(messages.length > 100) {
                messages = messages.slice(messages.length - 100);
            }
            iosockets.emit("chat:dispatch", message);
            console.log("[chat] dispatching new message from " + socket.username + " : " + content);
        });

        socket.on('chat:adduser', function (username) {
            if(username && username.length > 0) {
                // we store the username in the socket session for this client
                socket.username = username;
                usernames.push(username);
                console.log("[chat] new user " + username);

                // send all past messages to the user
                socket.emit("chat:dispatch", messages);

                // update user list on all clients
                iosockets.emit("chat:users", usernames);
            }
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