var OfficeModule = require(__dirname + "/../../../../src/office-module"),
    http = require("http"),
    https = require("https"),
    url = require('url');

var ThermonitorModule = OfficeModule.extend({

    start: function () {
        console.log("[" + this.config["id"] + "] refreshing temperature every " + this.config["refresh"] + " seconds");

        var serverUrl = url.parse(this.config["server"]);

        this.options = {
            hostname: serverUrl["hostname"],
            port: serverUrl["port"] ? serverUrl["port"] : (serverUrl["protocol"] === "https:" ? 443 : 80),
            path: serverUrl["pathname"] + "/measure?nb=20",
            method: "GET"
        };

        // proxy conf
        if (this.proxy) {
            this.options.hostname = this.proxy["host"];
            this.options.port = this.proxy["port"];
            this.options.path = serverUrl["protocol"] + "//" + serverUrl["host"] + this.options.path;
        }

        // No SSL ?
        if (this.proxy || (serverUrl["protocol"] === "http:")) {
            https = http;
        }

        this.timer = setInterval(this.getData.bind(this), this.config["refresh"] * 1000);
    },

    getData: function (socket) {
        this.getLastMeasures((function (measures) {
            (socket ? socket : this.iosockets).emit(this.config["id"] + ":measures", measures);
        }).bind(this));
    },

    getLastMeasures: function (callback) {
        var req = https.request(this.options, (function (res) {
            var data = "";
            res.on("data", function (d) {
                data += d;
            });
            res.on("end", (function () {
                if (callback) {
                    var measures = JSON.parse(data);
                    callback(measures);
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

module.exports = ThermonitorModule;