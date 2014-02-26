define(["jquery",
    "underscore",
    "socket-io",
    "hbs!templates/modules-list",
    "hbs!templates/modules-dashboard",
    "constants"],

    function ($, _, io, modulesListTemplate, modulesDashboardTemplate) {
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

            el.find(".admin-modules li").click(function() {
                var type = $(this).html();
                console.log("type : " + type);
                socket.emit('add-module-instance', { "id": type + "-" + Math.round(Math.random() * 1000), "type": type });
            });
        });

        socket.on('modules-instances', function (modules) {
            el.find(".admin-dashboard").html(modulesDashboardTemplate({ "modules": modules }));
        });
    }
);