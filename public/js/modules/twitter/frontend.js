define([ "jquery", "socket-io", "hbs!modules/twitter/template","helpers"],
    function($, socketio, template, helpers) {

        var _rootEl, _config, _socket, _el;
        var displayedTweets = [];

        return {
            start: function(config, rootEl) {
                _rootEl = rootEl;
                _config = config;

                console.info("[twitter] module started");

                this.init();

                _socket = socketio.connect(window.office.node_server_url, { "force new connection": true });
                _socket.emit("twitter:screen");
                _socket.on("twitter:tweets", this.displayTweets.bind(this));
                _socket.on("twitter:stream", this.displayStreamedTweet.bind(this));
            },

            /* Display N first tweets */
            displayTweets: function(tweets) {
                if(tweets) {
                    displayedTweets = tweets;
                    console.info("[twitter] " + displayedTweets.length + " tweets fetched - " + new Date());
                    _el.html(template({ "tweets": displayedTweets }));
                }
                else {
                    console.warn("no tweets to display");
                }
            },

            /* Display new streamed tweet */
            displayStreamedTweet: function(tweet) {
                // Refresh tweets list
                if(displayedTweets.length >= 6) {
                    displayedTweets.pop();
                }
                displayedTweets.unshift(tweet);

                // Refresh view
                _el.html(template({ "tweets": displayedTweets, "topics": _config["topics"] }));
            },

            init: function() {
                helpers.loadModuleCss(_config["id"]);
                if(_el === undefined) {
                    _rootEl.append($("<div/>", { "id": _config["id"], "class": "module" }));
                    _el = _rootEl.find("div#" + _config["id"]);
                }
            }
        }

    }
);