var OfficeModule = require(__dirname + "/../../../../src/office-module"),
    http = require('http'),
    https = require('https');

var JiraModule = OfficeModule.extend({

    start: function () {
        console.log("[" + this.config["id"] + "] refreshing issues every " + this.config['refresh'] + " seconds");
        this.timer = setInterval(this.getData.bind(this), this.config['refresh'] * 1000);

        //parseURI?
        
        this.options = {
            hostname: this.config['server'],
            port: 443,
            path: "/jira/rest/api/latest/search?jql=project=" + this.config['project'] + "&status=OPEN&startAt=0&maxResults=" + this.config['nb_issues_display'],
            method: 'GET',
            headers: {
                'Host': this.config['server'],
                'Authorization': 'Basic ' + new Buffer(this.config['user'] + ':' + this.config['password']).toString('base64')
            }
        };

        // proxy conf
        if (this.proxy) {
            this.options.hostname = this.proxy["host"];
            this.options.port = this.proxy["port"];
            this.options.path = 'https://' + this.config['server'] + this.options.path;
            https = http;
        }
    },

    getData: function (socket) {
        this.getLastIssues((function (issues) {
            (socket ? socket : this.iosockets).emit(this.config["id"] + ":issues", issues);
        }).bind(this));
    },

    getLastIssues: function (callback) {
        var req = https.request(this.options, (function (res) {
            var data = "";
            res.on('data', function (d) {
                data += d;
            });
            res.on('end', (function () {
                if (callback) {
                    var commits = JSON.parse(data);
                    callback(commits["issues"]);
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