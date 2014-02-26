var fs = require('fs'),
    path = require('path'),
    store = require('shelf.js').store;

var DashboardConfig = {

    listAvailableModules: function() {
        var modules = [];
        var modulesNames = fs.readdirSync(path.join(__dirname, "/../public/js/modules"));
        modulesNames.forEach(function(moduleName) {
            var configRaw = fs.readFileSync(path.join(__dirname, "/../public/js/modules", moduleName, "config.json"));
            configRaw = configRaw.toString('utf8');
            modules.push(JSON.parse(configRaw));
        });
        return modules;
    },

    getModulesConf: function() {
        var modules = store("modules");
        if(!modules) {
            modules = [];
            store("modules", modules, null, "fs");
        }
        return modules;
    },

    addModule: function(config) {
        var modules = this.getModulesConf();
        modules.push(config);
        store("modules", modules, null, "fs");
        console.log("storing modules : " + modules);
        return modules;
    }
}

module.exports = DashboardConfig;