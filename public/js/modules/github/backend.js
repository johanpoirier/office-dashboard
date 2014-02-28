var OfficeModule = require(__dirname + "/../../../../src/office-module"),
    http = require('http'),
    https = require('https');

var GithubModule = OfficeModule.extend({

    start: function () {
        console.log("[" + this.config["id"] + "] refreshing commits every " + (this.config['refresh'] / 1000) + " seconds");
        setInterval(this.getData.bind(this), this.config['refresh']);
    },

    getData: function () {
        this.getLastCommits((function (commits) {
            this.iosockets.emit(this.config["id"] + ":commits", commits);
        }).bind(this));
    },

    getLastCommits: function (callback) {
        var options = {
            hostname: this.config['host'],
            port: 443,
            path: this.config['path'],
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github.beta+json',
                'User-Agent': 'Office-Dashboard-app',
                'Authorization': 'token ' + this.config['token']
            }
        };

        // proxy conf
        if (this.proxyHost && this.proxyPort) {
            options.hostname = this.proxyHost;
            options.port = this.proxyPort;
            options.path = 'https://' + this.config['host'] + this.config['path'];
            https = http;
        }

        var req = https.request(options, (function (res) {
            var data = "";
            res.on('data', function (d) {
                data += d;
            });
            res.on('end', (function () {
                if (callback) {
                    var commits = JSON.parse(data);
                    callback(commits.slice(0, this.config['nb_commits_display']));
                }
            }).bind(this));
        }).bind(this));
        req.on('error', function (e) {
            console.error(e);
        });
        req.end();
    }
});

module.exports = GithubModule;