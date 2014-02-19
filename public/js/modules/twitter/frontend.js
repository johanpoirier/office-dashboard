/**
 * Twitter frontend controller
 */
define([ "office", "hbs!modules/twitter/template" ],
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
                    this.displayedTweets = tweets;
                    console.info("[twitter] " + this.displayedTweets.length + " tweets fetched - " + new Date());
                    this.el.html(template({ "tweets": this.displayedTweets }));
                }
                else {
                    console.warn("no tweets to display");
                }
            },

            /* Display new streamed tweet */
            displayStreamedTweet: function (tweet) {
                // Refresh tweets list
                if (this.displayedTweets.length >= 6) {
                    this.displayedTweets.pop();
                }
                this.displayedTweets.unshift(tweet);

                // Refresh view
                this.el.html(template({ "tweets": this.displayedTweets, "topics": this.config["topics"] }));
            }
        });

        return twitterModule;
    }
);