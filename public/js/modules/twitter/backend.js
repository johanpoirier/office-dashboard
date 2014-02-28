var OfficeModule = require(__dirname + "/../../../../src/office-module"),
    twitter = require('ptwitter');

var TwitterModule = OfficeModule.extend({

    twitterApi: null,

    start: function () {
        var proxy = null;
        if (this.proxyHost && this.proxyPort) {
            proxy = {
                "proxy": {
                    "host": this.proxyHost,
                    "port": this.proxyPort
                }
            };
        }

        this.twitterApi = new twitter({
            "consumer_key": this.config["consumer_key"],
            "consumer_secret": this.config["consumer_secret"],
            "access_token_key": this.config["access_token_key"],
            "access_token_secret": this.config["access_token_secret"],
            "proxy": proxy
        });

        /* On run - Stream new tweets */
        this.twitterApi.stream('statuses/filter', { track: this.config["topics"]}, (function (stream) {
            stream.on('data', (function (tweet) {
                this.iosockets.emit(this.config["id"] + ":stream", tweet);
            }).bind(this));
        }).bind(this));
    },

    getData: function () {
        this.getTweets((function (tweets) {
            this.iosockets.emit(this.config["id"] + ":tweets", tweets);
        }).bind(this));
    },

    getTweets: function (callback) {
        this.twitterApi.search(this.config["topics"][0], (function (data) {
            if(data.statuses) {
                callback(data.statuses.slice(0, this.config["fetched_items"]));
            }
            else {
                console.log("[" + this.config["id"] + "] " + data);
            }
        }).bind(this));
    }
});


module.exports = TwitterModule;