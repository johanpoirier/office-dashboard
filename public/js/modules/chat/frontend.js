/**
 * Chat frontend controller
 */
define([ "jquery", "socket-io", "handlebars", "hbs!modules/chat/template", "hbs!modules/chat/message-template", "helpers"],
    function ($, socketio, Handlebars, template, messageTemplate, helpers) {

        var _config, _socket, _rootEl, _el;

        var sendMessage = function () {
            var text = _el.find("textarea");
            if (text.val().length > 0) {
                _socket.emit("chat:message", text.val());
                text.val("");
            }
            return false;
        };

        var updateMesages = function (messages) {
            var text = _el.find(".chat-messages");
            if (!(messages instanceof Array)) {
                messages = [ messages ];
            }
            messages.forEach(function (message) {
                text.append(messageTemplate(message));
            });

            notify(messages[0]);

            text.scrollTop(text.prop("scrollHeight"));
        };

        var updateUsers = function (users) {
            var usersEl = _el.find(".chat-users");
            usersEl.html("");
            users.forEach(function (user) {
                usersEl.append(user + "<br>");
            });
        };

        var handleKeyPress = function (event) {
            if (event.keyCode == 13) {
                sendMessage();
                return false;
            }
        };

        var notify = function(message) {
            if(message) {
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
                        if(!('permission' in Notification)) {
                            Notification.permission = permission;
                        }

                        // If the user is okay, let's create a notification
                        if (permission === "granted") {
                            notification = new Notification(text);
                        }
                    });
                }

                if(notification) {
                    setTimeout(function() {
                        notification.close();
                    }, 5000);
                }
            }
        }

        return {
            start: function (config, rootEl) {
                console.info("[chat] module started");

                _config = config;
                _rootEl = rootEl;

                helpers.loadModuleCss(_config["id"]);

                if (_el === undefined) {
                    _rootEl.append($("<div/>", { "id": _config["id"], "class": "module" }));
                    _el = _rootEl.find("div#" + _config["id"]);
                }

                // socket init & listen
                _socket = socketio.connect(window.office.node_server_url, { "force new connection": true });

                _socket.on('connect', function () {
                    _socket.emit('chat:adduser', prompt("What's your name?"));
                });

                _socket.emit("chat:screen");
                _socket.on("chat:dispatch", updateMesages);
                _socket.on("chat:users", updateUsers);

                // render
                _el.html(template());
                _el.find("textarea").focus();

                // input watch
                _el.find("textarea").on("keypress", handleKeyPress);
                _el.find("button.btn").on("click", sendMessage);
            }
        }
    }
);