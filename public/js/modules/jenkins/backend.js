var OfficeModule = require(__dirname + "/../../../../src/office-module"),
    http = require('http');

var JenkinsModule = OfficeModule.extend({

    options: null,

    start: function () {
        this.options = {
            host: this.config['url'],
            port: 80,
            path: '/api/json?tree=jobs[name,color]',
            method: 'GET',
            headers: {
                'Host': this.config['url'],
                'Authorization': 'Basic ' + new Buffer(this.config['username'] + ':' + this.config['apiToken']).toString('base64')
            }
        }

        // proxy conf
        if (this.config['proxy_host'] && this.config['proxy_port']) {
            this.options.hostname = this.config['proxy_host'];
            this.options.port = this.config['proxy_port'];
            this.options.path = 'http://' + this.config['url'] + this.options.path;
        }

        setInterval(this.getData.bind(this), this.config['refresh']);
    },

    getJobsInError: function (callback) {
        if (this.config['username'] != '') {
            var jobs = [];
            var reqGet = http.request(this.options, (function (res) {
                var data = "";

                res.on('data', function (d) {
                    data += d;
                });

                res.on('end', (function () {
                    jobs = JSON.parse(data);

                    // get only jobs in error
                    jobs = jobs['jobs'].filter(function (job) {
                        return job.color == "red";
                    });

                    // set url to jenkins
                    jobs.forEach((function (job) {
                        job.url = "http://" + this.config["url"] + "/job/" + job.name;
                    }).bind(this));

                    console.log("[" + this.config["id"] + "] number of jobs in error : " + jobs.length);
                    if (callback) {
                        callback(jobs);
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
        this.getJobsInError((function (jobs) {
            this.iosockets.emit(this.config["id"] + ":jobs", jobs);
        }).bind(this));
    }
});

module.exports = JenkinsModule;