var assert = require("assert");
var GitModule = require(__dirname + "/../../../public/js/modules/git/backend");
var config = require(__dirname + '/../../config.json');

var iosocketMock = {
    clients: function () {
        return [];
    }
};
var getSocketMock = function (done) {
    return {
        emit: function () {
            done();
        }
    }
};

describe('GitModule', function () {
    describe('#init', function () {
        it('should call start when init', function (done) {
            this.timeout(30000);
            var git = new GitModule(config, {
                "id": "git-555",
                "type": "git",
                "repo": "office-dashboard",
                "branch": "master",
                "url": "https://github.com/johanpoirier/office-dashboard.git",
                "nb_commits_display": 2,
                "refresh": 3000000
            }, iosocketMock);
            git.getData(getSocketMock(done));
        });
    });
});