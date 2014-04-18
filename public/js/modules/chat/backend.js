var OfficeModule = require(__dirname + "/../../../../src/office-module");

var ChatModule = OfficeModule.extend({

    start: function () {
        this.messages = [{ "author": "bot", "content": "welcome to the chat" } ];
        this.users = [];

        this.registerSocketListener(this.config["id"] + ":adduser", (function (socket, username) {
            console.log("[" + this.config["id"] + "]" + " adduser socket : " + socket.id);
            console.log("[" + this.config["id"] + "]" + " adduser username : " + username);
            if (username && username.length > 0) {
                // we store the username in the socket session for this client
                socket[this.config["id"]] = {
                    "username": username
                };

                if(!this.getUser(socket.id, username)) {
                    this.users.push({
                        "username": username,
                        "socket": socket.id
                    });
                    console.log("[" + this.config["id"] + "] new user " + username);
                }

                // update user list on all clients
                this.iosockets.emit(this.config["id"] + ":users", this.users);
            }
        }).bind(this));

        this.registerSocketListener(this.config["id"] + ":message", (function (socket, content) {
            var username = this.getSocketUsername(socket);
            var message = {
                "author": username ? username : "Obi-Wan Kenobi",
                "content": this.enhanceContent(content)
            };
            this.messages.push(message);
            if (this.messages.length > 100) {
                this.messages = this.messages.slice(this.messages.length - 100);
            }
            this.iosockets.emit(this.config["id"] + ":dispatch", message);
        }).bind(this));
    },

    enhanceContent: function(content) {
        var urlRegexp = /https?:\/\/[a-zA-Z0-9\.\-\/\?#=!]*/;
        var links = content.match(urlRegexp);
        for(var i = 0; i < links.length; i++) {
            content = content.replace(links[i], "<a target=\"_blank\" href=\"" + links[i] + "\">" + links[i] + "</a>");
        }
        return content;
    },

    getData: function(socket) {
        // send all past messages to the user
        socket.emit(this.config["id"] + ":init", this.messages);
    },

    disconnect: function (socket) {
        var socketUsername = this.getSocketUsername(socket);
        if (socketUsername) {
            // remove the user from global user list
            this.users = this.users.filter(function (user) {
                return socketUsername !== user["username"] || socket.id !== user["socket"];
            });

            // update list of users in chat, client-side
            this.iosockets.emit(this.config["id"] + ":users", this.users);

            console.log("[" + this.config["id"] + "] user " + socketUsername + " just left");
        }
    },

    getSocketUsername: function(socket) {
        return socket[this.config["id"]] ? socket[this.config["id"]]["username"] : false;
    },

    getUser: function(socketId, username) {
        var usersFound = this.users.filter(function (user) {
            return username === user["username"] && socketId === user["socket"];
        });
        return (usersFound && usersFound.length === 1) ? usersFound[0] : false;
    }
});

module.exports = ChatModule;