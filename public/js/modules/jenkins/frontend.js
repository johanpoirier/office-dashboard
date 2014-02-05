define([ "jquery", "socket-io", "handlebars", "hbs!modules/jenkins/template"],
    function($, socketio, Handlebars, template) {

        var _rootEl, _config, _socket, _el;

        return {
            start: function(config, rootEl) {
                console.info("[jenkins] module started");
                _rootEl = rootEl;
                _config = config;
                _socket = socketio.connect("http://localhost:8080");
                _socket.emit("jenkins:screen");
                _socket.on("jenkins:jobs", this.displayJobs.bind(this));
            },

            displayJobs: function(jobs) {
                if(_el === undefined) {
                    _rootEl.append($("<div/>", { "id": _config["id"], "class": "pure-u-1-5 module" }));
                    _el = _rootEl.find("div#" + _config["id"]);
                }
                console.info("[jenkins] " + jobs.length + " jobs in error - " + new Date());
                _el.html(template({ "jobs": jobs }));
            }
        }
    }
);