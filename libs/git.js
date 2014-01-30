var https = require('https');

var config;

 exports.withConfig = function(cfg) {
    console.log("Git module loaded");
    config = cfg;
    return this;
}

exports.getLastCommits = function() {
    var options = {
        host: config['host'],
        port: 80,
        path: config['path'],
        method: 'GET'
    };
}