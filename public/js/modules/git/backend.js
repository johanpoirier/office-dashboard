var OfficeModule = require(__dirname + "/../../../../src/office-module"),
    exec = require('child_process').exec,
    os = require('os'),
    fs = require('fs'),
    path = require('path');

var GitModule = OfficeModule.extend({

    commits: [],
    lastUpdate: null,
    processing: false,

    start: function () {
        console.log("[" + this.config["id"] + "] refreshing data every " + (this.config['refresh'] / 1000) + " seconds");
        this.isWin = /^win/.test(os.platform());
        setInterval(this.getData.bind(this), this.config['refresh']);
    },

    getData: function (socket) {
        // check git logs if no data or data too old
        if(!this.processing && (this.commits.length === 0 || Date.now() > this.lastUpdate + this.config["refresh"])) {
            this.processing = true;

            var url = this.config["url"];
            if(this.config["user"] && this.config["user"].length > 0 && this.config["password"].length > 0) {
                var urlParts = url.split("//");
                url = urlParts[0] + "//" + this.config["user"] + ":" + this.config["password"] + "@" + urlParts[1];
            }

            var cmd = [ this.isWin ? '' : 'sudo ', __dirname, '/getlogs.', (this.isWin ? 'bat' : 'sh' ), ' "', this.globalConfig["tempDir"], '" "', this.config["repo"],
                '" ', url, ' "', (this.proxy && !this.proxy.bypass(this.config["url"]) ? this.proxy["url"] : ""), '" ',
                this.config["branch"], ' ', 50 ];

            exec(cmd.join(""),
                (function (error, stdout, stderr) {
                    if (stderr !== null && stderr.length > 0) {
                        console.log("[" + this.config["id"] + "] " + stderr);
                    }
                    fs.readFile(path.join(this.globalConfig["tempDir"], this.config["repo"], "/logs"), (function (err, data) {
                        this.sendData(socket ? socket : this.iosockets, err, data);
                    }).bind(this));
                }).bind(this)
            );
        }
        // send last updated data
        else {
            (socket ? socket : this.iosockets).emit(this.config["id"] + ":commits", this.commits.slice(0, this.config["nb_commits_display"]));
        }
    },

    sendData: function (socket, err, data) {
        this.processing = false;
        if (data && data.length > 0) {
            var commitsRaw = data.toString('utf8').match(/[^\r\n]+/g);
            var commits = [];
            if (commitsRaw && commitsRaw.length > 0) {
                for (var i = 0; i < commitsRaw.length; i++) {
                    var commitData = commitsRaw[i].split(";");
                    commits.push({ "author": commitData[0], "message": commitData[1], "date": commitData[2] });
                }
                console.log("[" + this.config["id"] + "] send data - " + this.config["nb_commits_display"] + " commits");
                this.commits = commits;
                this.lastUpdate = Date.now();
                socket.emit(this.config["id"] + ":commits", commits.slice(0, this.config["nb_commits_display"]));
            }
            else {
                console.error("[" + this.config["id"] + "] unable to parse git logs", commitsRaw);
            }
        }
        else {
            console.error("[" + this.config["id"] + "] logs data is not readable", data);
        }
    }
});

module.exports = GitModule;