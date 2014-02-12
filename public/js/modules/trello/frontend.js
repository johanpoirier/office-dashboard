define([ "jquery", "socket-io", "handlebars", "hbs!modules/trello/template"],
    function($, socketio, Handlebars, template) {

        var _rootEl, _config, _socket, _el;

        return {
            start: function(config, rootEl) {
                console.info("[trello] module started");
                _rootEl = rootEl;
                _config = config;
                _socket = socketio.connect("http://10.40.244.6:8080", { "force new connection": true });
                _socket.emit("trello:screen");
                _socket.on("trello:activities", this.displayActivities.bind(this));
            },

            displayActivities: function(activities) {
                if(_el === undefined) {
                    _rootEl.append($("<div/>", { "id": _config["id"], "class": "pure-u-1-5 module" }));
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