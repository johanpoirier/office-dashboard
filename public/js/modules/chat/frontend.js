/**
 * Chat frontend controller
 */
define([ "jquery", "socket-io", "hbs!modules/chat/template", "hbs!modules/chat/message-template", "helpers"],
    function ($, socketio, template, messageTemplate, helpers) {

        var chat = {
            _config: {},
            _socket: null,
            _rootEl: null,
            _el: null,

            sendMessage: function () {
                var text = this._el.find("textarea");
                if (text.val().length > 0) {
                    this._socket.emit(this._config["id"] + ":message", text.val());
                    text.val("");
                }
                return false;
            },

            updateMesages: function (messages) {
                var text = this._el.find(".chat-messages");
                if (!(messages instanceof Array)) {
                    messages = [ messages ];
                }
                messages.forEach(function (message) {
                    text.append(messageTemplate(message));
                });

                this.notify(messages[0]);

                text.scrollTop(text.prop("scrollHeight"));
            },

            updateUsers: function (users) {
                var usersEl = this._el.find(".chat-users");
                usersEl.html("");
                users.forEach(function (user) {
                    usersEl.append(user + "<br>");
                });
            },

            handleKeyPress: function (event) {
                if (event.keyCode == 13) {
                    this.sendMessage();
                    return false;
                }
            },

            notify: function (message) {
                if (message && (document.webkitHidden || document.hidden)) {
                    var notification;
                    var text = message.author + " : " + message.content;

                    // Let's check if the browser supports notifications
                    if (!("Notification" in window)) {
                        alert("This browser does not support desktop notification");
                    }

                    // Let's check if the user is okay to get some notification
                    else if (Notification.permission === "granted") {
                        // If it's okay let's create a notification
                        notification = new Notification(text);
                    }

                    // Otherwise, we need to ask the user for permission
                    // Note, Chrome does not implement the permission static property
                    // So we have to check for NOT 'denied' instead of 'default'
                    else if (Notification.permission !== 'denied') {
                        Notification.requestPermission(function (permission) {

                            // Whatever the user answers, we make sure we store the information
                            if (!('permission' in Notification)) {
                                Notification.permission = permission;
                            }

                            // If the user is okay, let's create a notification
                            if (permission === "granted") {
                                notification = new Notification(text);
                            }
                        });
                    }

                    if (notification) {
                        setTimeout(function () {
                            notification.close();
                        }, 5000);
                    }
                }
            },

            start: function (config, rootEl) {
                this._config = config;
                this._rootEl = rootEl;

                console.info("[" + this._config["id"] + "] module started");

                helpers.loadModuleCss(this._config["type"]);

                if (this._el === null) {
                    this._rootEl.append($("<div/>", { "id": this._config["id"], "class": "module " + this._config["type"] }));
                    this._el = this._rootEl.find("div#" + this._config["id"]);
                }

                // socket init & listen
                this._socket = socketio.connect(window.office.node_server_url, { "force new connection": true });

                this._socket.on('connect', (function () {
                    this._socket.emit(this._config["id"] + ":adduser", prompt("What's your name?"));
                }).bind(this));

                this._socket.emit(this._config["id"] + ":screen");
                this._socket.on(this._config["id"] + ":dispatch", this.updateMesages.bind(this));
                this._socket.on(this._config["id"] + ":users", this.updateUsers.bind(this));

                // render
                this._el.html(template());
                this._el.find("textarea").focus();

                // input watch
                this._el.find("textarea").on("keypress", this.handleKeyPress.bind(this));
                this._el.find("button.btn").on("click", this.sendMessage.bind(this));
            }
        };

        return chat;
    }
);