var OfficeModule = require(__dirname + "/../../../../src/office-module"),
    twitter = require('ptwitter');

var TwitterModule = OfficeModule.extend({

    twitterApi: null,

    start: function () {
        var proxyConf = null;
        if (this.proxy) {
            proxyConf = {
                "proxy": {
                    "host": this.proxy["host"],
                    "port": this.proxy["port"]
                }
            };
        }

        this.twitterApi = new twitter({
            "consumer_key": this.config["consumer_key"],
            "consumer_secret": this.config["consumer_secret"],
            "access_token_key": this.config["access_token_key"],
            "access_token_secret": this.config["access_token_secret"],
            "proxy": proxyConf
        });

        /* On run - Stream new tweets */
        this.startStream();
    },

    reload: function () {
        TwitterModule.__super__.reload.apply(this, arguments);
        this.startStream();
    },

    startStream: function () {
        this.stopStream();
        if (this.config["topics"] && this.config["topics"].length > 0) {
            var d = require('domain').create();
            d.on('error', (function(err){
                // handle the error safely
                console.log("[" + this.config["id"] + "] " + err);
            }).bind(this));
            d.run((function() {
                this.twitterApi.stream('statuses/filter', { track: this.config["topics"]}, (function (stream) {
                    this.stream = stream;
                    stream.on('data', (function (tweet) {
                        this.iosockets.emit(this.config["id"] + ":stream", tweet);
                    }).bind(this));
                }).bind(this));
            }).bind(this));
        }
    },

    stopStream: function () {
        if (this.stream && this.stream["destroy"]) {
            console.log("[" + this.config["id"] + "] destroying twitter stream");
            this.stream.destroy();
            delete this.stream;
        }
    },

    getData: function (socket) {
        this.getTweets((function (tweets) {
            (socket ? socket : this.iosockets).emit(this.config["id"] + ":tweets", tweets);
        }).bind(this));
    },

    getTweets: function (callback) {
        var topics = this.config["topics"];
        if (topics && topics.length > 0) {
            this.twitterApi.search(topics[0], (function (data) {
                if (data.statuses) {
                    callback(data.statuses.slice(0, this.config["fetched_items"]));
                }
                else {
                    console.log("[" + this.config["id"] + "] " + data);
                }
            }).bind(this));
        } else {
            // send empty array to refresh module front display
            callback([]);
        }
    }
});


module.exports = TwitterModule;