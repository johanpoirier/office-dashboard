define([ "jquery", "socket-io", "handlebars", "hbs!modules/github/template"],
    function($, socketio, Handlebars, template) {

        var _rootEl, _config, _socket, _el;

        return {
            start: function(config, rootEl) {
                console.info("github module init");
                _rootEl = rootEl;
                _config = config;
                _socket = socketio.connect("http://localhost:8080");
                _socket.on("github:commits", this.displayCommits.bind(this));
            },

            displayCommits: function(commits) {
                if(_el === undefined) {
                    _rootEl.append($("<div/>", { "id": _config["id"] }));
                    _el = _rootEl.find("div#" + _config["id"]);
                }
                _el.html(template({ "commits": commits }));
            }
        }
    }
);