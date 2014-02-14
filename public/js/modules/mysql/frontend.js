define([ "jquery", "socket-io", "handlebars", "hbs!modules/mysql/template"],
    function($, socketio, Handlebars, template) {

        var _rootEl, _config, _socket, _el;

        return {
            start: function(config, rootEl) {
                console.info("[mysql] module started");
                _rootEl = rootEl;
                _config = config;
                _socket = socketio.connect(window.office.node_server_url, { "force new connection": true });
                _socket.emit("mysql:screen");
                _socket.on("mysql:businessMessage", this.displayMessages.bind(this));
            },

            displayMessages: function(messages) {
                if(_el === undefined) {
                    _rootEl.append($("<div/>", { "id": _config["id"], "class": "module" }));
                    _el = _rootEl.find("div#" + _config["id"]);
                }

                // Format messages
                var formattedMessages = [];
                messages.forEach(function(message) {
                    var formattedMessage =  {};
                    _config['fields'].forEach(function(field) {
                        formattedMessage[field.field_displayed_name] = message[field.field_table_name];
                    });
                    formattedMessages.push(formattedMessage);
                });

                _el.html(template({ "messages": formattedMessages }));
            }
        }
    }
);