define([ "jquery", "socket-io", "handlebars", "hbs!modules/github/template"],
    function($, socketio, Handlebars, template) {

        var _rootEl, _config, _socket, _el;

        return {
            start: function(config, rootEl) {
                console.info("[github] module started");
                _rootEl = rootEl;
                _config = config;
                _socket = socketio.connect(window.office.node_server_url, { "force new connection": true });
                _socket.emit("github:screen");
                _socket.on("github:commits", this.displayCommits.bind(this));
            },

            displayCommits: function(commits) {
                if(_el === undefined) {
                    _rootEl.append($("<div/>", { "id": _config["id"], "class": "module" }));
                    _el = _rootEl.find("div#" + _config["id"]);
                }
                console.info("[github] " + commits.length + " commits to display - " + new Date());
                _el.html(template({
                    "repo": _config["repo"],
                    "commits": commits
                }));
            }
        }
    }
);