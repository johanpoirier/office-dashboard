var http = require('http');
var https = require('https');

var config, iosockets;

exports.withConfig = function(cfg) {
    config = cfg;
    console.log("[" + config["id"] + "] module loaded");
    return this;
}

exports.start = function(socketio) {
    var githubModule = this;
    iosockets = socketio;
    iosockets.on('connection', function (socket) {
        socket.on(config["id"] + ":screen", getData.bind(githubModule));
    });
    setInterval(getData.bind(this), config['refresh']);
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

    // proxy conf
    if(config['proxy_host'] && config['proxy_port']) {
        options.hostname = config['proxy_host'];
        options.port = config['proxy_port'];
        options.path = 'https://' + config['host'] + config['path'];
        https = http;
    }

    var req = https.request(options, function (res) {
        var data = "";
        res.on('data', function(d) {
            data += d;
        });
        res.on('end', function() {
            if(callback) {
                var commits = JSON.parse(data);
                callback(commits.slice(0, config['nb_commits_display']));
            }
        });
    });
    req.on('error', function(e) {
        console.error(e);
    });
    req.end();
}

var getData = function() {
    this.getLastCommits(function(commits) {
        iosockets.emit(config["id"] + ":commits", commits);
    });
};