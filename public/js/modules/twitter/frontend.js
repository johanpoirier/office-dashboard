/**
 * Twitter frontend controller
 */
define([ "office", "hbs!modules/twitter/template", "hbsCustomHelpers" ],
    function (Office, template) {

        var twitterModule = Office.Module.extend({

            displayedTweets: [],

            listen: function () {
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.on(this.config["id"] + ":tweets", this.displayTweets.bind(this));
                this.socket.on(this.config["id"] + ":stream", this.displayStreamedTweet.bind(this));
            },

            /* Display N first tweets */
            displayTweets: function (tweets) {
                if (tweets) {
                    tweets.forEach((function(tweet) {
                        tweet["text"] = this.enhanceContent(tweet["text"]);
                    }).bind(this));
                    this.displayedTweets = tweets;
                    console.info("[twitter] " + this.displayedTweets.length + " tweets fetched - " + new Date());
                }
                else {
                    this.displayedTweets = [];
                    console.warn("no tweets to display");
                }
                this.el.html(template({ "tweets": this.displayedTweets, "topics": this.config["topics"] }));
            },

            /* Display new streamed tweet */
            displayStreamedTweet: function (tweet) {
                tweet["text"] = this.enhanceContent(tweet["text"]);

                // Refresh tweets list
                if (this.displayedTweets.length >= this.config["fetched_items"]) {
                    this.displayedTweets.pop();
                }
                this.displayedTweets.unshift(tweet);

                // Refresh view
                this.el.html(template({ "tweets": this.displayedTweets, "topics": this.config["topics"] }));
                this.alert(3);
            },

            enhanceContent: function(content) {
                var urlRegexp = /https?:\/\/[a-zA-Z0-9\.\-\/\?#=!]*/g;
                var links = content.match(urlRegexp);
                if(links && links.length > 0) {
                    for(var i = 0; i < links.length; i++) {
                        content = content.replace(links[i], "<a target=\"_blank\" href=\"" + links[i] + "\">" + links[i] + "</a>");
                    }
                }
                return content;
            }
        });

        return twitterModule;
    }
);