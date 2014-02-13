define([ "jquery", "socket-io", "handlebars", "hbs!modules/mysql-errors/template"],
    function($, socketio, Handlebars, template) {

        var _rootEl, _config, _socket, _el;

        return {
            start: function(config, rootEl) {
                console.info("[mysql-errors] module started");
                _rootEl = rootEl;
                _config = config;
                _socket = socketio.connect(window.office.node_server_url, { "force new connection": true });
                _socket.emit("mysqlErrors:screen");
                _socket.on("mysqlErrors:businessErrors", this.displayErrors.bind(this));
            },

            displayErrors: function(errors) {
                if(_el === undefined) {
                    _rootEl.append($("<div/>", { "id": _config["id"], "class": "module" }));
                    _el = _rootEl.find("div#" + _config["id"]);
                }
                var formattedErrors = [];
                errors.forEach(function(error) {
                    var formattedError =  {};
                    formattedError.id= error[_config["error_id_field"]];
                    formattedError.customerId= error[_config["customer_id_field"]];
                    formattedError.date= error[_config["date_field"]];
                    formattedError.description= error[_config["description_field"]];
                    formattedError.server= error[_config["sever_field"]];
                    formattedError.criticity= error[_config["criticity_field"]];
                    formattedError.action= error[_config["action_field"]];
                    formattedErrors.push(formattedError);
                });

                console.log(formattedErrors);
                _el.html(template({ "errors": formattedErrors }));
            }
        }
    }
);