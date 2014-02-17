var config, iosockets;
var messages = [], usernames = [];
var id;

exports.withConfig = function (cfg) {
    config = cfg;
    id = config["id"];
    console.log("[" + id + "] module loaded");
    return this;
}

exports.start = function (socketio) {
    iosockets = socketio;

    iosockets.on('connection', function (socket) {
        socket.on(id + ":message", function (content) {
            var message = { "author": socket.username , "content": content };
            messages.push(message);
            if(messages.length > 100) {
                messages = messages.slice(messages.length - 100);
            }
            iosockets.emit(id + ":dispatch", message);
            console.log("[" + id + "] dispatching new message from " + socket.username + " : " + content);
        });

        socket.on(id + ":adduser", function (username) {
            if(username && username.length > 0) {
                // we store the username in the socket session for this client
                socket.username = username;
                usernames.push(username);
                console.log("[" + id + "] new user " + username);

                // send all past messages to the user
                socket.emit(id + ":dispatch", messages);

                // update user list on all clients
                iosockets.emit(id + ":users", usernames);
            }
        });

        socket.on("disconnect", function () {
            if (socket.username) {
                // remove the username from global usernames list
                usernames = usernames.filter(function(username) {
                    return socket.username !== username;
                });

                // update list of users in chat, client-side
                iosockets.emit(id + ":users", usernames);

                console.log("[" + config["id"] + "] user " + socket.username + " just left");
            }
        });
    });
}