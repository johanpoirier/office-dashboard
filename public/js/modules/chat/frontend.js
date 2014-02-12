/**
 * Chat frontend controller
 */
define([ "jquery", "socket-io", "handlebars", "hbs!modules/chat/template", "hbs!modules/chat/message-template"],
    function($, socketio, Handlebars, template, messageTemplate) {

        var _config, _socket, _el;

        var sendMessage = function() {
            var text = _el.find("textarea");
            if(text.val().length > 0) {
                _socket.emit("chat:message", text.val());
                text.val("");
            }
            return false;
        };

        var updateMesages = function(messages) {
            var text = _el.find(".chat-messages");
            if(!(messages instanceof Array)) {
                messages = [ messages ];
            }
            messages.forEach(function(message) {
                text.append(messageTemplate(message));
            });
            text.scrollTop(text.prop("scrollHeight"));
        };

        var updateUsers = function(users) {
            var usersEl = _el.find(".chat-users");
            usersEl.html("");
            users.forEach(function(user) {
                usersEl.append(user + "<br>");
            });
        };

        var handleKeyPress = function(event) {
            if(event.keyCode == 13) {
                sendMessage();
                return false;
            }
        };

        return {
            start: function(config) {
                console.info("[chat] module started");

                _config = config;
                _el = $("div#chat");

                // socket init & listen
                _socket = socketio.connect("http://10.40.244.6:8080", { "force new connection": true });

                _socket.on('connect', function() {
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