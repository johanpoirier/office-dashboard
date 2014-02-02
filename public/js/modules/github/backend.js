var https = require('https');

var config;
var socket;

 exports.withConfig = function(cfg) {
    console.log("Github module loaded");
    config = cfg;
    return this;
}

exports.getLastCommits = function(callback) {
    var options = {
        hostname: config['host'],
        port: 443,
        path: config['path'],
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.github.beta+json',
            'User-Agent': 'Office-Dashboard-app',
            'Authorization': 'token ' + config['token']
        }
    };

    var req = https.request(options, function (res) {
        var data = "";
        res.on('data', function(d) {
            data += d;
        });
        res.on('end', function() {
            if(callback) {
                callback(JSON.parse(data));
            }
        });
    });
    req.on('error', function(e) {
        console.error(e);
    });
    req.end();
}

var startScheduledTask = function() {
    this.getLastCommits(function(commits) {
        socket.emit("github:commits", commits);
    });
};

exports.start = function(socketio) {
    socket = socketio;
    startScheduledTask.call(this);
    setInterval(startScheduledTask.bind(this), 300000);
}