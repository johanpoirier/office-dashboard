var assert = require("assert");
var GithubModule = require(__dirname + "/../../../public/js/modules/github/backend");
var config = require(__dirname + '/../../config.json');
var ProxyConf = require(__dirname + '/../../../src/proxy-conf.js');

var iosocketMock = {
    clients: function () {
        return [];
    },
    emit: function() {}
};

describe('GithubModule', function () {
    describe('#getLastCommits()', function () {
        it('should get last commits of office-dashboard', function (done) {
            this.timeout(20000);

            var github = new GithubModule(config, {
                "id": "github-456",
                "type": "github",
                "host": "api.github.com",
                "repo": "office-dashboard",
                "user": "johanpoirier",
                "token": "6661e628354e10a070761f7c8c93f8f370d229b3",
                "nb_commits_display": 2,
                "refresh": 3000
            }, iosocketMock, ProxyConf.getProxyConf(config));

            github.getLastCommits(function(commits) {
                if(commits.length == 2) {
                    done();
                }
                else {
                    done("error when getting commits : " + commits);
                }
            });
        });
    });
});