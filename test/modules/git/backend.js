var assert = require("assert");
var GitModule = require(__dirname + "/../../../public/js/modules/git/backend");
var config = require(__dirname + '/../../config.json');
var ProxyConf = require(__dirname + '/../../../src/proxy-conf.js');

var iosocketMock = {
    clients: function () {
        return [];
    },
    emit: function() {}
};

describe('GitModule', function () {
    describe('#init', function () {
        it('should call start when init', function () {
            this.timeout(30000);

            var git = new GitModule(config, {
                "id": "git-555",
                "type": "git",
                "repo": "office-dashboard",
                "branch": "master",
                "url": "https://github.com/johanpoirier/office-dashboard.git",
                "nb_commits_display": 2,
                "refresh": 3000000
            }, iosocketMock, ProxyConf.getProxyConf(config));
        });
    });
});