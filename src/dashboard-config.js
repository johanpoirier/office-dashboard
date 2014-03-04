var fs = require('fs'),
    path = require('path'),
    storage = require('node-persist');

var DashboardConfig = {

    instances: [],
    config: {},

    init: function(config) {
        this.config = config;
        if(config && config["tempDir"]) {
            this.config["tempDir"] = path.join(__dirname, "..", config["tempDir"]);
            storage.initSync({
                "dir": path.join(this.config["tempDir"], "persist")
            });
        }
        else {
            storage.initSync();
        }

        if(config["proxy_host"] && config["proxy_host"].length > 0 && config["proxy_port"]) {
            this.proxy = {
                "host": config["proxy_host"],
                "port": config["proxy_port"],
                "url": "http://" + config["proxy_host"] + ":" + config["proxy_port"]
            }
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

    loadModule: function(globalConfig, moduleConfig, iosockets) {
        var OfficeModule = require('../public/js/modules/' + moduleConfig['type'] + '/backend');
        this.instances.push(new OfficeModule(globalConfig, moduleConfig, iosockets, this.proxy));
    },

    deleteModule: function(moduleId) {
        // remove module from conf
        var modules = this.getModulesConf();
        console.log(modules);
    }
}

module.exports = DashboardConfig;