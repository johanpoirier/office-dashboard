var http = require('http');

var username, apiToken, url, options;

exports.withConfig = function(config) {
    username = config['username'];
    apiToken = config['apiToken'];
    url = config['url'];
    options = {
        host: config['url'],
        port: 80,
        path: '/api/json?tree=jobs[name,color]',
        method: 'GET',
        headers: {
            'Host': config['url'],
            'Authorization': 'Basic ' + new Buffer(username + ':' + apiToken).toString('base64')
        }
    }
    console.log("Jenkins module loaded");
    return this;
}

exports.getJobsInError = function(callback) {
    if(username != '') {
        var jobs = [];
        var reqGet = http.request(options, function (res) {
            var data = "";

            res.on('data', function (d) {
                data += d;
            });

            res.on('end', function () {
                jobs = JSON.parse(data);

                // get only jobs in error
                jobs = jobs['jobs'].filter(function (job) {
                    return job.color == "red";
                });

                // set url to jenkins
                jobs.forEach(function(job) {
                    job.url = "http://" + url + "/job/" + job.name;
                });

                console.log("jobs jenkins in error : " + jobs.length);
                if(callback) {
                    callback(jobs);
                }
            });
        });

        reqGet.on('error', function (e) {
            console.error(e);
        });

        reqGet.end();
    }
    else {
        console.warn('jenkins module not configured');
        callback([]);
    }
};
