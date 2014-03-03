define(["jquery",
    "underscore",
    "socket-io",
    "office",
    "hbs!templates/modules-list",
    "hbs!templates/modules-dashboard",
    "hbs!templates/module-conf",
    "constants"],

    function ($, _, io, Office, modulesListTemplate, modulesDashboardTemplate, moduleconfigTemplate) {
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
                    var moduleConfig = new Office.ModuleConfig($("body"), moduleConfigPattern[0], moduleconfigTemplate, socket);
                    moduleConfig.displayModuleConfForm(function() {
                        el.removeClass("fade");
                    });
                }
            });
        });

        socket.on('modules-instances', function (modules) {
            el.find(".admin-dashboard").html(modulesDashboardTemplate({ "modules": modules }));

            el.find(".admin-dashboard .module-instance").click(function() {
                var type = $(this).data("type");
                var id = $(this).attr("id");

                var moduleConfig = modules.filter(function (mod) {
                    return mod.id === id;
                });
                if (moduleConfig.length > 0 && moduleConfig[0].admin !== undefined) {
                    require(["modules/" + type + "/admin"], function (AdminModule) {
                        new AdminModule(moduleConfig[0], $("body"));
                    });
                }
                else {
                    console.warn("no admin for " + type + " module")
                };
            });
        });
    }
);