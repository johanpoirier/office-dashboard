var OfficeModule = require(__dirname + "/../../../../src/office-module"),
    http = require('http'),
    https = require('https');

var TrelloModule = OfficeModule.extend({

    option: null,

    start: function () {
        this.options = {
            hostname: this.config['host'],
            port: 443,
            path: this.config['path'] + "&key=" + this.config['key'] + "&token=" + this.config['token'],
            method: 'GET'
        };

        // proxy conf
        if (this.proxy) {
            this.options.hostname = this.proxy['host'];
            this.options.port = this.proxy['port'];
            this.options.path = 'https://' + this.config['host'] + this.config['path'] + "&key=" + this.config['key'] + "&token=" + this.config['token'];
            https = http;
        }

        setInterval(this.getData.bind(this), this.config['refresh']);
    },

    getData: function () {
        this.getActivity((function (activities) {
            this.iosockets.emit(this.config["id"] + ":activities", activities);
        }).bind(this));
    },

    getActivity: function (callback) {
        var req = https.request(this.options, function (res) {
            var data = "";
            res.on('data', function (d) {
                data += d;
            });
            res.on('end', function () {
                if (callback) {
                    var activities = JSON.parse(data);
                    callback(activities);
                }
            });
        });
        req.on('error', function (e) {
            console.error(e);
        });
        req.end();
    }
});

module.exports = TrelloModule;