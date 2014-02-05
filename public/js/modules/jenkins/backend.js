var http = require('http');

var config, socket;
var options;

exports.withConfig = function(cfg) {
    console.log("Jenkins module loaded");
    config = cfg;
    options = {
        host: config['url'],
        port: 80,
        path: '/api/json?tree=jobs[name,color]',
        method: 'GET',
        headers: {
            'Host': config['url'],
            'Authorization': 'Basic ' + new Buffer(config['username'] + ':' + config['apiToken']).toString('base64')
        }
    }
    return this;
}

exports.start = function(socketio) {
    socket = socketio;
    socket.on("jenkins:screen", getData.bind(this));
    setInterval(getData.bind(this), config['refresh']);
}

exports.getJobsInError = function(callback) {
    if(config['username'] != '') {
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
                    job.url = "http://" + config["url"] + "/job/" + job.name;
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

var getData = function() {
    this.getJobsInError(function(jobs) {
        socket.emit("jenkins:jobs", jobs);
    });
};
