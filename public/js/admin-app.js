define(["jquery",
    "underscore",
    "socket-io",
    "libs/module-config",
    "hbs!templates/modules-list",
    "hbs!templates/modules-dashboard",
    "constants"],

    function ($, _, io, ModuleConfig, modulesListTemplate, modulesDashboardTemplate, moduleConfTemplate) {
        var el = $("#admin");
        var modulesList = [];

        var socket = io.connect(window.office.node_server_url);
        socket.on('connect', function () {
            socket.emit('get-modules-list');
            socket.emit('get-modules-instances');
        });

        socket.on('modules-list', function (modules) {
            modulesList = modules;
            el.find(".admin-modules").html(modulesListTemplate({ "modules": modulesList }));

            el.find(".admin-modules li").click(function () {
                var type = $(this).html();
                var moduleConfigPattern = modulesList.filter(function (mod) {
                    return mod.type === type;
                });

                if (moduleConfigPattern.length > 0) {
                    el.addClass("fade");
                    var moduleConfig = new ModuleConfig($("body"), moduleConfigPattern[0], socket);
                    moduleConfig.displayModuleConfForm(function() {
                        el.removeClass("fade");
                    });
                }
            });
        });

        socket.on('modules-instances', function (modules) {
            el.find(".admin-dashboard").html(modulesDashboardTemplate({ "modules": modules }));
        });
    }
);