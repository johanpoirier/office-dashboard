var assert = require("assert");
var OfficeModule = require(__dirname + "/../src/office-module");
var config = require(__dirname + '/config.json');

var clientMock = {
    on: function(event) {

    }
};

var socketMock = {
    clients: function() {
        return [ clientMock ];
    },
    emit: function() {
    }
};

describe('OfficeModule', function () {
    describe('#init', function () {
        it('should call start when init', function (done) {
            var TestModule = OfficeModule.extend({
                start: function() {
                    done();
                }
            });
            new TestModule(config, { "id": "test-42", type: "test" }, socketMock);
        });
    });
});