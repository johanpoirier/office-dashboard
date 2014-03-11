var OfficeModule = require(__dirname + "/../../../../src/office-module");

var ChatModule = OfficeModule.extend({
    messages: [{ "author": "bot", "content": "welcome to the chat" } ],
    usernames: [],

    start: function () {
        this.registerSocketListener(this.config["id"] + ":adduser", (function (socket, username) {
            console.log(this.config["id"] + ":adduser socket : " + socket.id);
            console.log(this.config["id"] + ":adduser username : " + username);
            if (username && username.length > 0) {
                // we store the username in the socket session for this client
                socket.username = username;
                this.usernames.push(username);
                console.log("[" + this.config["id"] + "] new user " + username);

                // update user list on all clients
                this.iosockets.emit(this.config["id"] + ":users", this.usernames);
            }
        }).bind(this));

        this.registerSocketListener(this.config["id"] + ":message", (function (socket, content) {
            var message = { "author": socket.username, "content": content };
            this.messages.push(message);
            if (this.messages.length > 100) {
                this.messages = this.messages.slice(this.messages.length - 100);
            }
            this.iosockets.emit(this.config["id"] + ":dispatch", message);
        }).bind(this));
    },

    getData: function(socket) {
        // send all past messages to the user
        socket.emit(this.config["id"] + ":init", this.messages);
    },

    disconnect: function (socket) {
        if (socket.username) {
            // remove the username from global usernames list
            this.usernames = this.usernames.filter(function (username) {
                return socket.username !== username;
            });

            // update list of users in chat, client-side
            this.iosockets.emit(this.config["id"] + ":users", this.usernames);

            console.log("[" + this.config["id"] + "] user " + socket.username + " just left");
        }
    }
});

module.exports = ChatModule;