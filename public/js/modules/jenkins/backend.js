var OfficeModule = require(__dirname + "/../../../../src/office-module"),
    http = require('http');

var JenkinsModule = OfficeModule.extend({

    options: null,

    start: function () {
        var path;
        if (this.config["mode"] === "error") {
            path = "/api/json?tree=jobs[name,color,url]";
        }
        else if (this.config["mode"] === "queue") {
            path = "/queue/api/json?tree=items[task[name],why]";
        }

        this.options = {
            host: this.config['url'],
            port: 80,
            path: path,
            method: 'GET',
            headers: {
                'Host': this.config['url'],
                'Authorization': 'Basic ' + new Buffer(this.config['username'] + ':' + this.config['apiToken']).toString('base64')
            }
        }

        // proxy conf
        if (this.proxy && !this.proxy.bypass(this.config['url'])) {
            this.options.hostname = this.proxy["host"];
            this.options.port = this.proxy["port"];
            this.options.path = 'http://' + this.config['url'] + this.options.path;
        }

        console.log("[" + this.config["id"] + "] refreshing data every " + this.config['refresh'] + "s");
        this.timer = setInterval(this.getData.bind(this), this.config['refresh'] * 1000);
    },

    getJobsInError: function (callback) {
        this.callApi(callback, function(items) {
            return items["jobs"].filter(function (job) {
                return job.color == "red";
            });
        });
    },

    getBuildQueue: function (callback) {
        this.callApi(callback, function(items) {
            return items["items"];
        });
    },

    callApi: function (callback, filter) {
        if (this.config['username'].length > 0) {
            var items = [];
            var reqGet = http.request(this.options, (function (res) {
                var data = "";

                res.on('data', function (d) {
                    data += d;
                });

                res.on('end', (function () {
                    items = JSON.parse(data);

                    // apply filter if any
                    if (filter) {
                        items = filter(items);
                    }

                    console.log("[" + this.config["id"] + "] number of items : " + items.length);
                    if (callback) {
                        callback(items);
                    }
                }).bind(this));
            }).bind(this));

            reqGet.on('error', function (e) {
                console.error(e);
            });

            reqGet.end();
        }
        else {
            console.warn("[" + this.config["id"] + "] module not configured");
            callback([]);
        }
    },

    getData: function () {
        if (this.config["mode"] === "error") {
            this.getJobsInError((function (jobs) {
                this.iosockets.emit(this.config["id"] + ":jobs", jobs);
            }).bind(this));
        }
        else if (this.config["mode"] === "queue") {
            this.getBuildQueue((function (items) {
                this.iosockets.emit(this.config["id"] + ":items", items);
            }).bind(this));
        }
    },

    dispose: function() {
        if(this.timer) {
            clearInterval(this.timer);
        }
    }
});

module.exports = JenkinsModule;