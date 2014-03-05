define(["jquery",
    "underscore",
    "socket-io",
    "office",
    "hbs!templates/modules-list",
    "hbs!templates/modules-dashboard",
    "hbs!templates/module-conf",
    "hbs!templates/module-delete",
    "constants"],

    function ($, _, io, Office, modulesListTemplate, modulesDashboardTemplate, moduleConfigTemplate, moduleDeleteTemplate) {
        var el = $("#admin");
        var modulesList = [];

        // Reference to current admin module (modal window)
        var adminModule = null;

        var socket = io.connect(window.office.node_server_url);
        socket.on('connect', function () {
            socket.emit('admin-get-modules-kinds');
            socket.emit('admin-get-modules-instances');
        });

        socket.on('admin-send-modules-kinds', function (modules) {
            console.log("admin received modules kinds");
            modulesList = modules;
            el.find(".admin-modules").html(modulesListTemplate({ "modules": modulesList }));

            /* Listener - click on add button */
            el.find(".admin-modules li").click(function () {
                var type = $(this).html();
                var moduleConfigPattern = modulesList.filter(function (mod) {
                    return mod.type === type;
                });

                if (moduleConfigPattern.length > 0) {
                    el.addClass("fade");
                    var moduleConfig = new Office.ModuleConfig($("body"), moduleConfigPattern[0], moduleConfigTemplate, socket);
                    moduleConfig.displayModuleConfForm(function() {
                        el.removeClass("fade");
                    });
                }
            });
        });

        socket.on('admin-send-modules-instances', function (modules) {
            console.log("admin received modules instances");
            el.find(".admin-dashboard-instances").html(modulesDashboardTemplate({ "modules": modules }));

            /* Listener - click on administrate button and display modal */
            el.find(".admin-dashboard-instances .module-instance input.admin").click(function() {
                if(!adminModule) {
                    var type = $(this).parent().data("type");
                    var id = $(this).parent().attr("id");

                    var moduleConfig = modules.filter(function (mod) {
                        return mod.id === id;
                    });
                    if (moduleConfig.length > 0 && moduleConfig[0].admin !== undefined) {
                        require(["modules/" + type + "/admin"], function (AdminModule) {
                            el.addClass("fade");
                            adminModule = new AdminModule(moduleConfig[0], $("body"));
                            /* Listener - click on close button and hide administration modal */
                            $(".module-admin .close-modal").click((function() {
                                el.removeClass("fade");
                                adminModule.close();
                                adminModule = null;
                                $(".module-admin").remove();
                            }).bind(this));
                        });
                    }
                    else {
                        console.warn("no admin for " + type + " module");
                    };
                }   
            });

            /* Listener - click on delete button */
            el.find(".admin-dashboard-instances .module-instance input.delete").click(function() {
                var id = $(this).parent().attr("id");
                el.addClass("fade");
                var moduleDelete = new Office.ModuleDelete($("body"), id, moduleDeleteTemplate, socket);
                moduleDelete.displayModuleDeleteForm(function() {
                    el.removeClass("fade");
                });
            });
        });
    }
);