define([ "jquery", "socket-io", "handlebars", "hbs!modules/chat/template"],
    function($, socketio, Handlebars, template) {

        var _config, _socket, _el;

        var sendMessage = function(e) {
            var text = _el.find("textarea");
            _socket.emit("chat:message", text.val());
            text.val("");
            return false;
        };

        var updateMesages = function(message) {
            var text = _el.find(".chat-messages");
            text.append(message + "<br>");
        };

        return {
            start: function(config) {
                console.info("[chat] module started");

                _config = config;
                _el = $("div#chat");

                // socket init & listen
                _socket = socketio.connect("http://localhost:8080", { "forceNew" : true });
                _socket.emit("chat:screen");
                _socket.on("chat:dispatch", updateMesages);

                // render
                _el.html(template());

                // input watch
                _el.find("button.btn").on("click", sendMessage);
            }
        }
    }
);