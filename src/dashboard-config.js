var fs = require('fs'),
    path = require('path'),
    storage = require('node-persist');

storage.initSync();

var DashboardConfig = {

    instances: [],

    init: function(tempDir) {
        if(tempDir) {
            storage.initSync({
                "dir": path.join(__dirname, "..", tempDir, "persist")
            });
        }
        else {
            storage.initSync();
        }
    },

    listAvailableModules: function() {
        var modules = [];
        var modulesNames = fs.readdirSync(path.join(__dirname, "../public/js/modules"));
        modulesNames.forEach(function(moduleName) {
            var configRaw = fs.readFileSync(path.join(__dirname, "../public/js/modules", moduleName, "config.json"));
            configRaw = configRaw.toString('utf8');
            modules.push(JSON.parse(configRaw));
        });
        return modules;
    },

    getModulesConf: function() {
        var modules = storage.getItem("modules");
        if(!modules) {
            modules = [];
            storage.setItem("modules", modules);
        }
        return modules;
    },

    addModule: function(config) {
        var modules = this.getModulesConf();
        modules.push(config);
        storage.setItem("modules", modules);
        return modules;
    },

    loadModule: function(config, iosockets) {
        var OfficeModule = require('../public/js/modules/' + config['type'] + '/backend');
        this.instances.push(new OfficeModule(config, iosockets));
    }
}

module.exports = DashboardConfig;