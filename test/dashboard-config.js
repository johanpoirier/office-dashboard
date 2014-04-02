var assert = require("assert");
var DashboardConfig = require(__dirname + "/../src/dashboard-config");
var OfficeModule = require(__dirname + "/../src/office-module");
var config = require(__dirname + '/config.json');

var socketMock = {
    clients: function() {
        return [];
    },
    emit: function() {
    }
};

describe('DashboardConfig', function () {
    DashboardConfig.init(config);

    before(function (done) {
        DashboardConfig.deleteAllModules();
        done();
    });

    describe('#init()', function () {
        it('proxy should be initialized', function () {
            assert.equal("http://proxy.priv.atos.fr:3128", DashboardConfig.proxy.url);
        });
    });

    describe('#listAvailableModules()', function () {
        var modulesKinds = DashboardConfig.listAvailableModules();
        it('there must be multiple modules available', function () {
            assert.equal(true, modulesKinds.length > 0);
        });
        it('chat module must be available', function () {
            var moduleRes = modulesKinds.filter(function (mod) {
                return mod["type"] === "chat";
            });
            assert.equal(true, moduleRes.length == 1);
        });
    });
    describe('#addOrUpdateModule()', function () {
        var plopModuleConf = {
            "id": "plop-666",
            "type": "plop",
            "size": { "w": 1, "h": 1 },
            "position": { "x": 3, "y": 3 }
        };

        it('new module should be present', function () {
            DashboardConfig.addOrUpdateModule(plopModuleConf);
            assert.equal("plop", DashboardConfig.getModuleConf("plop-666").type);
            assert.equal(1, DashboardConfig.getModulesConf().length);
        });

        it('updated module should have new value', function () {
            plopModuleConf.refresh = 60000;
            DashboardConfig.addOrUpdateModule(plopModuleConf);
            assert.equal(60000, DashboardConfig.getModuleConf("plop-666").refresh);
            assert.equal(1, DashboardConfig.getModulesConf().length);
        });

        it('adding another module of same type should be ok', function () {
            var plopModuleConf2 = {
                "id": "plop-42",
                "type": "plop",
                "size": { "w": 2, "h": 1 },
                "position": { "x": 1, "y": 1 }
            };
            DashboardConfig.addOrUpdateModule(plopModuleConf2);
            assert.equal(2, DashboardConfig.getModulesConf().length);
        });
    });

    describe('#deleteModule()', function () {
        it('deleted module should not be in modules list', function () {
            DashboardConfig.deleteModule("plop-666");
            var modulesFound = DashboardConfig.getModulesConf().filter(function (mod) {
                return mod["id"] === "plop-666";
            });
            assert.equal(0, modulesFound.length);
        });
    });

    describe('#deleteAllModules()', function () {
        it('there should not be any module left', function () {
            DashboardConfig.deleteAllModules();
            assert.equal(0, DashboardConfig.getModulesConf().length);
        });
    });

    describe('#saveGlobalConf()', function () {
        var nbCol = Math.round(Math.random() * 12);
        DashboardConfig.saveGlobalConf({ "grid": { "columns": nbCol, "rows": 3 } });
        it('should create global config', function () {
            var conf = DashboardConfig.getGlobalConf();
            assert.equal(nbCol, conf["grid"]["columns"]);
        });
    });

    describe('#loadModule()', function () {
        var iframeConf = {
            "id": "iframe-17",
            "type": "iframe",
            "size": { "w": 1, "h": 1 },
            "position": { "x": 1, "y": 1 }
        };

        it('should load iframe module', function () {
            DashboardConfig.loadModule(config, iframeConf, socketMock);
            assert.equal(1, DashboardConfig.getModuleInstances().length);
            assert.equal("iframe", DashboardConfig.getModuleInstance(iframeConf.id).config["type"]);
        });

        it('should update iframe module', function () {
            iframeConf.size = { "w": 2, "h": 2 };
            DashboardConfig.loadModule(config, iframeConf, socketMock);
            assert.equal(1, DashboardConfig.getModuleInstances().length);
            assert.equal(2, DashboardConfig.getModuleInstance(iframeConf.id).config["size"]["h"]);
        });

        it('should load chat module', function () {
            var chatConf = {
                "id": "chat-22",
                "type": "chat",
                "size": { "w": 1, "h": 1 },
                "position": { "x": 2, "y": 1 }
            };
            DashboardConfig.loadModule(config, chatConf, socketMock);
            assert.equal(2, DashboardConfig.getModuleInstances().length);
            assert.equal("chat", DashboardConfig.getModuleInstance(chatConf.id).config["type"]);
        });

        it('should load another chat module', function () {
            var chatConf = {
                "id": "chat-33",
                "type": "chat",
                "size": { "w": 1, "h": 1 },
                "position": { "x": 3, "y": 1 }
            };
            DashboardConfig.loadModule(config, chatConf, socketMock);
            assert.equal(3, DashboardConfig.getModuleInstances().length);
            assert.equal("chat", DashboardConfig.getModuleInstance(chatConf.id).config["type"]);
        });
    });
});