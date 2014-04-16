var OfficeModule = require(__dirname + "/../../../../src/office-module"),
    http = require('http'),
    https = require('https');

var JiraModule = OfficeModule.extend({

    start: function () {
        console.log("[" + this.config["id"] + "] refreshing issues every " + this.config['refresh'] + " seconds");
        this.timer = setInterval(this.getData.bind(this), this.config['refresh'] * 1000);
    },

    getData: function (socket) {
        this.getLastIssues((function (issues) {
            (socket ? socket : this.iosockets).emit(this.config["id"] + ":issues", issues);
        }).bind(this));
    },

    getLastIssues: function (callback) {
        var options = {
            hostname: this.config['server'],
            port: 443,
            path: "/jira/rest/api/latest/issue/PHT-METEOFRANCE-999",
            method: 'GET',
            headers: {
                'Host': this.config['server'],
                'Authorization': 'Basic ' + new Buffer(this.config['username'] + ':' + this.config['apiToken']).toString('base64')
            }
        };

        // proxy conf
        if (this.proxy) {
            options.hostname = this.proxy["host"];
            options.port = this.proxy["port"];
            options.path = 'https://' + this.config['server'] + "/jira/rest/api/latest/issue/PHT-METEOFRANCE-999";
            https = http;
        }

        var req = https.request(options, (function (res) {
            var data = "";
            res.on('data', function (d) {
                data += d;
            });
            res.on('end', (function () {
                if (callback) {
                    //var commits = JSON.parse(data);
                    //callback(commits.slice(0, this.config['nb_issues_display']));
                    console.log("[" + this.config["id"] + "] data : " + data);
                    callback([]);
                }
            }).bind(this));
        }).bind(this));
        req.on('error', function (e) {
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

module.exports = JiraModule;