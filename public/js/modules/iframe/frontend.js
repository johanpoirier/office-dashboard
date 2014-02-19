define([ "jquery", "socket-io", "hbs!modules/iframe/template", "helpers"],
    function ($, socketio, template, helpers) {

        var _rootEl, _config, _socket, _el;

        return {
            start: function (config, rootEl) {
                console.info("[iframe] module started");
                _rootEl = rootEl;
                _config = config;

                helpers.loadModuleCss(_config["id"]);

                _socket = socketio.connect(window.office.node_server_url, { "force new connection": true });
                _socket.emit("iframe:screen");
                _socket.on("iframe:page", this.displayPage.bind(this));
            },

            displayPage: function (page) {
                if (_el === undefined) {
                    var cssClasses = "module";
                    if(_config["fullscreen"]) {
                        cssClasses += " fullscreen";
                    }
                    _rootEl.append($("<div/>", { "id": _config["id"], "class": cssClasses }));
                    _el = _rootEl.find("div#" + _config["id"]);
                }
                console.info("[iframe] page to display : " + page);
                _el.html(template({
                    "url": page
                }));
            }
        }
    }
);