define([ "jquery", "socket-io", "handlebars", "hbs!modules/twitter/template"],
    function($, socketio, Handlebars, template) {

        var _rootEl, _config, _socket, _el;

        return {
            start: function(config, rootEl) {
                console.info("[twitter] module started");
                _rootEl = rootEl;
                _config = config;
                _socket = socketio.connect(window.office.node_server_url, { "force new connection": true });
                _socket.emit("twitter:screen");
                _socket.on("twitter:tweets", this.displayTweets.bind(this));
            },

            displayTweets: function(tweets) {
                if(_el === undefined) {
                    _rootEl.append($("<div/>", { "id": _config["id"], "class": "module" }));
                    _el = _rootEl.find("div#" + _config["id"]);
                }
                console.info("[twitter] " + tweets.length + " tweets fetched - " + new Date());
                _el.html(template({ "tweets": tweets }));
            }
        }
    }
);