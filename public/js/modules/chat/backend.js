var OfficeModule = require(__dirname + "/../../../../src/office-module");

var ChatModule = OfficeModule.extend({
    messages: [],
    usernames: [],

    start: function () {
        var self = this;
        self.iosockets.on('connection', function (socket) {
            socket.on(self.config["id"] + ":message", function (content) {
                var message = { "author": socket.username, "content": content };
                self.messages.push(message);
                if (self.messages.length > 100) {
                    self.messages = self.messages.slice(self.messages.length - 100);
                }
                self.iosockets.emit(self.config["id"] + ":dispatch", message);
            });

            socket.on(self.config["id"] + ":adduser", function (username) {
                if (username && username.length > 0) {
                    // we store the username in the socket session for this client
                    socket.username = username;
                    self.usernames.push(username);
                    console.log("[" + self.config["id"] + "] new user " + username);

                    // send all past messages to the user
                    socket.emit(self.config["id"] + ":dispatch", self.messages);

                    // update user list on all clients
                    self.iosockets.emit(self.config["id"] + ":users", self.usernames);
                }
            });

            socket.on("disconnect", function () {
                if (socket.username) {
                    // remove the username from global usernames list
                    self.usernames = self.usernames.filter(function (username) {
                        return socket.username !== username;
                    });

                    // update list of users in chat, client-side
                    self.iosockets.emit(self.config["id"] + ":users", self.usernames);

                    console.log("[" + self.config["id"] + "] user " + socket.username + " just left");
                }
            });
        });
    }
});

module.exports = ChatModule;