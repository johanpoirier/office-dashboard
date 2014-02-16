/**
 * MySQL frontend controller
 */
define([ "jquery", "socket-io", "handlebars", "hbs!modules/mysql/template", "helpers", "hbsCustomHelpers"],
    function ($, socketio, Handlebars, template, helpers) {

        var _rootEl, _config, _socket, _el;

        return {
            start: function (config, rootEl) {
                console.info("[mysql] module started");

                _rootEl = rootEl;
                _config = config;

                helpers.loadModuleCss(_config["id"]);

                _socket = socketio.connect(window.office.node_server_url, { "force new connection": true });
                _socket.emit("mysql:screen");
                _socket.on("mysql:businessMessage", this.displayMessages.bind(this));
            },

            displayMessages: function (messages) {
                if (_el === undefined) {
                    _rootEl.append($("<div/>", { "id": _config["id"], "class": "module" }));
                    _el = _rootEl.find("div#" + _config["id"]);
                }

                // Gather fields names
                var fields = [];
                _config['fields'].forEach(function (field) {
                    fields.push(field.field_displayed_name);
                });

                // Format messages
                var formattedMessages = [];
                messages.forEach(function (message) {
                    var formattedMessage = {};
                    _config['fields'].forEach(function (field) {
                        formattedMessage[field.field_displayed_name] = message[field.field_table_name];
                    });
                    formattedMessages.push(formattedMessage);
                });

                _el.html(template({ "title": _config["title"], "messages": formattedMessages, "fields": fields }));
            }
        }
    }
);