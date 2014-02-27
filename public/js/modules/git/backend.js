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
        var cmd = [ __dirname, '/getlogs.', (this.isWin ? 'bat' : 'sh' ), ' "', this.globalConfig["tempDir"], '" "', this.config["repo"],
            '" ', this.config["url"], ' "', (this.proxy ? this.proxy["url"] : ""), '" ',
            this.config["branch"], ' ', this.config["nb_commits_display"] ];

        exec(cmd.join(""),
            (function (error, stdout, stderr) {
                if (stderr !== null && stderr.length > 0) {
                    console.log("[" + this.config["id"] + "] " + stderr);
                }
                fs.readFile(path.join(this.globalConfig["tempDir"], this.config["repo"], "/logs"), this.sendData.bind(this));
            }).bind(this)
        );
    },

    sendData: function(err, data) {
        var commitsRaw = data.toString('utf8').match(/[^\r\n]+/g);
        var commits = [];
        for(var i=0; i<commitsRaw.length; i++) {
            var commitData = commitsRaw[i].split(";");
            commits.push({ "author": commitData[0], "message": commitData[1], "date": commitData[2] });
        }
        this.iosockets.emit(this.config["id"] + ":commits", commits.slice(0, this.config["nb_commits_display"]));
    }
});

module.exports = GitModule;