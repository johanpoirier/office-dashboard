var OfficeModule = require(__dirname + "/../../../../src/office-module"),
    http = require("http"),
    https = require("https");

var GithubModule = OfficeModule.extend({

    start: function () {
        console.log("[" + this.config["id"] + "] refreshing commits every " + this.config["refresh"] + " seconds");
        this.timer = setInterval(this.getData.bind(this), this.config["refresh"] * 1000);
    },

    getData: function (socket) {
        this.getLastCommits((function (commits) {
            (socket ? socket : this.iosockets).emit(this.config["id"] + ":commits", commits);
        }).bind(this));
    },

    getLastCommits: function (callback) {
        var options = {
            hostname: this.config["host"],
            port: 443,
            path: "/repos/" + this.config["user"] + "/" + this.config["repo"] + "/commits",
            method: "GET",
            headers: {
                "Accept": "application/vnd.github.beta+json",
                "User-Agent": "Office-Dashboard-app",
                "Authorization": "token " + this.config["token"]
            }
        };

        // proxy conf
        if (this.proxy) {
            options.hostname = this.proxy["host"];
            options.port = this.proxy["port"];
            options.path = "https://" + this.config["host"] + "/repos/" + this.config["user"] + "/" + this.config["repo"] + "/commits";
            https = http;
        }

        var req = https.request(options, (function (res) {
            var data = "";
            res.on("data", function (d) {
                data += d;
            });
            res.on("end", (function () {
                if (callback) {
                    var commits = JSON.parse(data).slice(0, this.config["nb_commits_display"]);
                    callback(commits);
                }
            }).bind(this));
        }).bind(this));
        req.on("error", function (e) {
            console.error(e);
        });
        req.end();
    },

    dispose: function () {
        if(this.timer) {
            clearInterval(this.timer);
        }
    }
});

module.exports = GithubModule;