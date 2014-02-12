var http = require('http');
var https = require('https');

var config, iosockets;

exports.withConfig = function(cfg) {
    console.log("[trello] module loaded");
    config = cfg;
    return this;
}

exports.start = function(socketio) {
    var trelloModule = this;
    iosockets = socketio;
    iosockets.on('connection', function (socket) {
        socket.on("trello:screen", getData.bind(trelloModule));
    });
    setInterval(getData.bind(this), config['refresh']);
}

exports.getActivity = function(callback) {
    var options = {
        hostname: config['host'],
        port: 443,
        path: config['path'] + "&key=" + config['key'] + "&token=" + config['token'],
        method: 'GET'
    };

    // proxy conf
    if(config['proxy_host'] && config['proxy_port']) {
        options.hostname = config['proxy_host'];
        options.port = config['proxy_port'];
        options.path = 'https://' + config['host'] + config['path'] + "&key=" + config['key'] + "&token=" + config['token'];
        https = http;
    }

    var req = https.request(options, function (res) {
        var data = "";
        res.on('data', function(d) {
            data += d;
        });
        res.on('end', function() {
            if(callback) {
                var activities = JSON.parse(data);
                callback(activities);
            }
        });
    });
    req.on('error', function(e) {
        console.error(e);
    });
    req.end();
}

var getData = function() {
    this.getActivity(function(activities) {
        iosockets.emit("trello:activities", activities);
    });
};