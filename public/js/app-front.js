define(["jquery", "underscore", "socket-io", "helpers", "constants"], function ($, _, io, Helpers) {

    var globalConfig = {};
    var instances = [];

    var socket = io.connect(window.office.node_server_url);

    socket.on('connect', function () {
        socket.emit('front-get-global-conf');
    });

    socket.on('front-send-global-conf', function(config) {
        console.log("front received global conf");
        globalConfig = config;

        // set up modules grid layout
        var dashboardInstances = $("#modules");
        dashboardInstances.css("grid-template-columns", Helpers.generateGridTemplateProperty(globalConfig["grid"]["columns"]));
        dashboardInstances.css("grid-template-rows", Helpers.generateGridTemplateProperty(globalConfig["grid"]["rows"]));

        socket.emit('front-get-modules-instances');
    });

    socket.on('front-send-modules-instances', function (modules) {
        console.log("front received modules instances");
        modules.forEach(function (moduleConfig) {
            // Instanciate the module if it hasn't been yet
            // Only non-singleton modules with different ids can be instanciated several times
            var configs = _.pluck(instances, "config");
            var exist = _.findWhere(configs, { "type": moduleConfig["type"] });
            var instanciated = _.findWhere(configs, { "id": moduleConfig["id"] });
            var singleton = (typeof moduleConfig["singleton"] !== "undefined") ? moduleConfig["singleton"] : false;

            if (!instanciated) {
                if(!(exist && singleton)) {
                    // Instanciate front module
                    require(["modules/" + moduleConfig['type'] + "/frontend"], function (Module) {
                        instances.push(new Module(moduleConfig, $("#modules"), socket));
                    });
                }
            }
            else {
                // update module instance config
                _.findWhere(instances, { "id": instanciated["id"] }).updateConfig(moduleConfig);
            }
        });
    });

});