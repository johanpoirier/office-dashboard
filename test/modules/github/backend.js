var assert = require("assert");
var GitModule = require(__dirname + "/../../../public/js/modules/github/backend");
var config = require(__dirname + '/../../config.json');

var iosocketMock = {
    clients: function () {
        return [];
    }
};

describe('GithubModule', function () {
    describe('#getLastCommits()', function () {
        it('should get last commits of office-dashboard', function (done) {
            this.timeout(20000);

            var github = new GitModule(config, {
                "id": "github-456",
                "type": "github",
                "host": "api.github.com",
                "repo": "office-dashboard",
                "user": "johanpoirier",
                "token": "6661e628354e10a070761f7c8c93f8f370d229b3",
                "nb_commits_display": 2,
                "refresh": 30000000
            }, iosocketMock);

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