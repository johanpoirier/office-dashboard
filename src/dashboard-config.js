var fs = require('fs'),
    path = require('path'),
    storage = require('node-persist'),
    ProxyConf = require(__dirname + '/proxy-conf.js');

var DashboardConfig = {

    instances: [],
    config: {},

    init: function (config) {
        this.config = config;
        if (config && config["tempDir"]) {
            this.config["tempDir"] = path.join(__dirname, "..", config["tempDir"]);
            storage.initSync({
                "dir": path.join(this.config["tempDir"], "persist")
            });
        }
        else {
            storage.initSync();
        }

        this.proxy = ProxyConf.getProxyConf(config);
    },

    listAvailableModules: function () {
        var modules = [];
        var modulesNames = fs.readdirSync(path.join(__dirname, "../public/js/modules"));
        modulesNames.forEach(function (moduleName) {
            var configRaw = fs.readFileSync(path.join(__dirname, "../public/js/modules", moduleName, "config.json"));
            configRaw = configRaw.toString('utf8');
            modules.push(JSON.parse(configRaw));
        });
        return modules;
    },

    getModuleInstance: function (id) {
        var instance = this.instances.filter(function (module) {
            return module["id"] === id;
        });
        return (instance.length > 0) ? instance[0] : false;
    },

    getModuleInstances: function () {
        return this.instances;
    },

    getModuleConf: function (id) {
        var module = false;
        var modules = storage.getItem("modules");
        if (modules) {
            var moduleRes = modules.filter(function (module) {
                return module["id"] === id;
            });
            if (moduleRes.length > 0) {
                module = moduleRes[0];
            }
        }
        return module;
    },

    getModulesConf: function () {
        var modules = storage.getItem("modules");
        if (!modules) {
            modules = [];
            storage.setItem("modules", modules);
        }
        return modules;
    },

    getGlobalConf: function () {
        var config = storage.getItem("config");
        if (!config) {
            config = {
                "grid": {
                    "columns": 4,
                    "rows": 3
                }
            };
            storage.setItem("config", config);
        }
        return config;
    },

    saveGlobalConf: function (config) {
        storage.setItem("config", config);
    },

    addOrUpdateModule: function (config) {
        var modules = this.getModulesConf();
        var moduleFound = false;
        for (var i = 0; i < modules.length; i++) {
            if (modules[i]["id"] === config["id"]) {
                modules[i] = config;
                moduleFound = true;
                break;
            }
        }
        if (!moduleFound) {
            modules.push(config);
        }
        modules.forEach(function(module) {
            module["draggable"] = !module["dock"];
        });
        storage.setItem("modules", modules);
        return modules;
    },

    loadModule: function (globalConfig, moduleConfig, iosockets) {
        var instance = this.getModuleInstance(moduleConfig["id"]);
        if (!instance) {
            var OfficeModule = require('../public/js/modules/' + moduleConfig['type'] + '/backend');
            this.instances.push(new OfficeModule(globalConfig, moduleConfig, iosockets, this.proxy));
        }
        else {
            instance.reload(globalConfig, moduleConfig);
        }
    },

    deleteModule: function (moduleId) {
        // remove module from conf
        var modules = this.getModulesConf();
        modules.forEach(function (module, index) {
            if (module.id === moduleId) modules.splice(index, 1);
        });

        // remove module from storage
        storage.setItem("modules", modules);

        // remove module from instances
        this.instances.forEach(function (instance, index) {
            if (instance.config.id === moduleId) {
                instance.destroy();
                this.instances.splice(index, 1);
            }
        }.bind(this));
        return modules;
    },

    addNewClient: function (socket) {
        this.instances.forEach(function (mod) {
            mod.addClient(socket);
        });
    },

    disconnectModules: function (socket) {
        this.instances.forEach(function (mod) {
            mod.disconnect(socket);
        });
    },

    deleteAllModules: function() {
        storage.setItem("modules", []);
    }
}

module.exports = DashboardConfig;