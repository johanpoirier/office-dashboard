var twitter = require('twitter');

var config, iosockets;
var twitterApi;

exports.withConfig = function(cfg) {
    console.log("[twitter] module loaded");
    config = cfg;
    twitterApi = new twitter({
        consumer_key: config["consumer_key"],
        consumer_secret: config["consumer_secret"],
        access_token_key: config["access_token_key"],
        access_token_secret: config["access_token_secret"]
    });
    return this;
}

exports.start = function(socketio) {
    var twitterModule = this;
    iosockets = socketio;
    iosockets.on('connection', function (socket) {
        socket.on("twitter:screen", getData.bind(twitterModule));
    });
}

exports.getTweets = function(callback) {
    twitterApi.search('#nodejs', function(data) {
        console.log("[twitter] tweets : " + data);
        callback(data);
    });
};

var getData = function() {
    this.getTweets(function(tweets) {
        iosockets.emit("twitter:tweets", tweets);
    });
};
