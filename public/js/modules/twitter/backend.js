var http = require('http');

var config, iosockets;
var options;

exports.withConfig = function(cfg) {
    console.log("[twitter] module loaded");
    config = cfg;
    options = {
        host: 'twitter.com',
        port: 80,
        path: '/' + config,
        method: 'GET',
        headers: {
            'Host': config['url'],
            'Authorization': 'Basic ' + new Buffer(config['username'] + ':' + config['apiToken']).toString('base64')
        }
    }
    return this;
}

exports.start = function(socketio) {
    var jenkinsModule = this;
    iosockets = socketio;
    iosockets.on('connection', function (socket) {
        socket.on("jenkins:screen", getData.bind(jenkinsModule));
    });
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

                console.log("[jenkins] number of jobs in error : " + jobs.length);
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
        console.warn('[jenkins] module not configured');
        callback([]);
    }
};

var getData = function() {
    this.getJobsInError(function(jobs) {
        iosockets.emit("jenkins:jobs", jobs);
    });
};
