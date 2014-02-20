var OfficeModule = require(__dirname + "/../../../../src/office-module"),
    exec = require('child_process').exec;

var GitModule = OfficeModule.extend({

    start: function () {
        console.log("[" + this.config["id"] + "] refreshing commits every " + (this.config['refresh'] / 1000) + " seconds");
        setInterval(this.getData.bind(this), this.config['refresh']);
    },

    getData: function () {
        //cd /tmp; mkdir "gitest"; cd gitest; git remote add origin https://github.com/johanpoirier/office-dashboard.git; git fetch --depth 1 -n;
        exec(__dirname + '/getlogs.bat',
            function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            }
        );
    }
});

module.exports = GitModule;