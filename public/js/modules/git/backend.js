var OfficeModule = require(__dirname + "/../../../../src/office-module"),
    exec = require('child_process').exec,
    os = require('os'),
    fs = require('fs'),
    path = require('path');

var GitModule = OfficeModule.extend({

    start: function () {
        console.log("[" + this.config["id"] + "] refreshing data every " + (this.config['refresh'] / 1000) + " seconds");
        this.isWin = /^win/.test(os.platform());
        setInterval(this.getData.bind(this), this.config['refresh']);
    },

    getData: function () {
        exec(__dirname + '/getlogs.' + (this.isWin ? 'bat' : 'sh' ) + ' "' + __dirname + '" "' + this.config["repo"] + '" "' + this.config["url"] + '" "' + this.config["proxy"] + '"',
            (function (error, stdout, stderr) {
                if (stderr !== null) {
                    console.log("[" + this.config["id"] + "] error : " + error);
                }
                fs.readFile(path.join(__dirname,  this.config["repo"], "/logs"), this.sendData.bind(this));
            }).bind(this)
        );
    },

    sendData: function(err, data) {
        this.iosockets.emit(this.config["id"] + ":data", data.toString('utf8'));
    }
});

module.exports = GitModule;