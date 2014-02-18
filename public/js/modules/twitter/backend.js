var twitter = require('ptwitter');

var config, iosockets;
var twitterApi;

exports.withConfig = function (cfg) {
    console.log("[twitter] module loaded");
    config = cfg;

    var proxy = null;
    if (config["proxy_host"] && config["proxy_port"]) {
        proxy = {
            "proxy": {
                "host": config["proxy_host"],
                "port": config["proxy_port"]
            }
        };
    }

    twitterApi = new twitter({
        "consumer_key": config["consumer_key"],
        "consumer_secret": config["consumer_secret"],
        "access_token_key": config["access_token_key"],
        "access_token_secret": config["access_token_secret"],
        "proxy": proxy
    });

    return this;
}

exports.start = function (socketio) {
    var twitterModule = this;
    iosockets = socketio;
    /* On start - fetch N first tweets */
    /*iosockets.on('connection', function (socket) {
        socket.on("twitter:screen", getData.bind(twitterModule));
    });*/

    /* On run - Stream new tweets */
    twitterApi.stream('statuses/filter', { track: config["topics"]}, function (stream) {
        stream.on('data', function (tweet) {
            iosockets.emit("twitter:stream", tweet);
        });
    });
}

exports.getTweets = function (callback) {
    twitterApi.search("#lyonjs", function (data) {
        if(data.statuses) {
            callback(data.statuses.slice(0, config["fetched_items"]));
        }
        else {
            console.log("[twitter] " + data);
        }
    });
};

var getData = function () {
    this.getTweets(function (tweets) {
        iosockets.emit("twitter:tweets", tweets);
    });
};
