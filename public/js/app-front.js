define(["jquery", "underscore", "socket-io", "helpers", "constants"],
    function ($, _, io, Helpers) {

        var globalConfig = {};
        var instances = [];

        var socket = io.connect(window.office.node_server_url);

        socket.on(Events.CONNECT, function () {
            socket.emit(Events.FRONT_GET_GLOBAL_CONF);
        });

        socket.on(Events.FRONT_SEND_GLOBAL_CONF, function (config) {
            console.log("front received global conf");
            globalConfig = config;

            // set up modules grid layout
            var dashboardInstances = $("#modules");
            dashboardInstances.css("grid-template-columns", Helpers.generateGridTemplateProperty(globalConfig["grid"]["columns"]));
            dashboardInstances.css("grid-template-rows", Helpers.generateGridTemplateProperty(globalConfig["grid"]["rows"]));

            socket.emit(Events.FRONT_GET_MODULES_INSTANCES);
        });

        var addUpdateModule = function (moduleConfig) {
            // Instanciate the module if it hasn't been yet
            // Only non-singleton modules with different ids can be instanciated several times
            var configs = _.pluck(instances, "config");
            // 'exist' indicates whether or not a module of the same type has already been instanciated
            var exist = _.findWhere(configs, { "type": moduleConfig["type"] });
            // 'instanciated' indicates whether or not a module with the same id has already been instanciated
            var instanciated = _.findWhere(configs, { "id": moduleConfig["id"] });
            // 'singleton' indicates wether or not this kind of module is allowed to instanciated several times within the same view
            var singleton = (typeof moduleConfig["singleton"] !== "undefined") ? moduleConfig["singleton"] : false;

            if (!instanciated) {
                if (!(exist && singleton)) {
                    // Instanciate front module
                    console.log("add new module", moduleConfig["id"]);
                    require(["modules/" + moduleConfig['type'] + "/frontend"], function (Module) {
                        instances.push(new Module(moduleConfig, $("#modules"), socket));
                    });
                }
            }
            else {
                // update module instance config
                console.log("update module", moduleConfig["id"]);
                _.findWhere(instances, { "id": instanciated["id"] }).updateConfig(moduleConfig);
            }
        };

        // send all modules
        socket.on(Events.FRONT_SEND_MODULES_INSTANCES, function (modules) {
            console.log("front received modules instances");
            modules.forEach(addUpdateModule);

            // if no grid layout, fallback to gridster
            if (!("grid-row-start" in document.body.style)) {
                require(["gridster"], function () {
                    var modulesEl = $("#modules");
                    modulesEl.parent().addClass("gridster");
                    modulesEl.gridster({
                        widget_base_dimensions: [ Math.round($("body").width() / globalConfig["grid"]["columns"]), Math.round($("body").height() / globalConfig["grid"]["rows"])],
                        widget_margins: [0, 0]
                    });
                    modulesEl.width($("body").width());
                });
            }
        });

        // Add new module
        socket.on(Events.FRONT_ADD_MODULE_INSTANCE, addUpdateModule);

        // Delete existing module
        socket.on(Events.FRONT_DELETE_MODULE_INSTANCE, function (moduleId) {
            console.log("delete module instance ", moduleId);

            // Destroy module instances
            var toDestroy = false;
            var indexDelete = null;
            instances.forEach(function (module, index) {
                if (moduleId === module.config.id) {
                    toDestroy = true;
                    indexDelete = index;
                }
            });
            if (toDestroy) {
                instances[indexDelete].destroy();
                instances.splice(indexDelete, 1);
            }
        });
    }
);