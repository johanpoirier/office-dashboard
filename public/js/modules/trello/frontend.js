define([ "jquery", "socket-io", "hbs!modules/trello/template"],
    function($, socketio, template) {

        var _rootEl, _config, _socket, _el;

        return {
            start: function(config, rootEl) {
                console.info("[trello] module started");
                _rootEl = rootEl;
                _config = config;
                _socket = socketio.connect(window.office.node_server_url, { "force new connection": true });
                _socket.emit("trello:screen");
                _socket.on("trello:activities", this.displayActivities.bind(this));
            },

            displayActivities: function(activities) {
                if(_el === undefined) {
                    _rootEl.append($("<div/>", { "id": _config["id"], "class": "module" }));
                    _el = _rootEl.find("div#" + _config["id"]);
                }
                console.info("[trello] " + activities.length + " activities to display - " + new Date());
                _el.html(template({
                    "board": _config["board"],
                    "activities": activities
                }));
            }
        }
    }
);