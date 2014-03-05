define(["jquery",
    "underscore",
    "socket-io",
    "office",
    "helpers",
    "hbs!templates/modules-list",
    "hbs!templates/modules-dashboard",
    "hbs!templates/module-conf",
    "hbs!templates/module-delete",
    "constants"],

    function ($, _, io, Office, Helpers, modulesListTemplate, modulesDashboardTemplate, moduleConfigTemplate, moduleDeleteTemplate) {
        var el = $("#admin");
        var modulesList = [];
        var globalConfig;

        // Reference to current admin module (modal window)
        var adminModule = null;

        var socket = io.connect(window.office.node_server_url);
        socket.on('connect', function () {
            socket.emit('admin-get-global-conf');
        });

        var resizeDashBoardGrid = function() {
            var dashboardInstances = el.find(".admin-dashboard-instances");
            dashboardInstances.css("grid-template-columns", Helpers.generateGridTemplateProperty(globalConfig["grid"]["columns"]));
            dashboardInstances.css("grid-template-rows", Helpers.generateGridTemplateProperty(globalConfig["grid"]["rows"]));
        };

        var computeGridPosition = function(width, height, x, y) {
            return {
                "x": Math.ceil((x / width) * globalConfig["grid"]["columns"]),
                "y": Math.ceil((y / height) * globalConfig["grid"]["rows"])
            }
        };

        socket.on('admin-send-global-conf', function (config) {
            globalConfig = config;
            socket.emit('admin-get-modules-kinds');
            socket.emit('admin-get-modules-instances');
        });

        socket.on('admin-send-modules-kinds', function (modules) {
            console.log("admin received modules kinds");
            modulesList = modules;
            el.find(".admin-modules").html(modulesListTemplate({ "modules": modulesList }));

            // enable copy drag on module kinds list
            el.find(".admin-modules li").bind("dragstart", function(e) {
                e.originalEvent.dataTransfer.effectAllowed = 'copy'; // only dropEffect='copy' will be dropable
                e.originalEvent.dataTransfer.setData('type', $(this).text());
            });
        });

        socket.on('admin-send-modules-instances', function (modules) {
            console.log("admin received modules instances");

            // dashboard global config
            var dashboardConfigEl = el.find(".admin-dashboard-grid-config");
            var dashboardConfigGridColumns = dashboardConfigEl.find("input[name='columns']");
            dashboardConfigGridColumns.val(globalConfig["grid"]["columns"]);
            var dashboardConfigGridRows = dashboardConfigEl.find("input[name='rows']");
            dashboardConfigGridRows.val(globalConfig["grid"]["rows"]);

            // listen to grid cols & rows change
            dashboardConfigGridColumns.change(function() {
                globalConfig["grid"]["columns"] = dashboardConfigGridColumns.val();
                socket.emit('admin-save-global-conf', globalConfig);
                resizeDashBoardGrid();
            });
            dashboardConfigGridRows.change(function() {
                globalConfig["grid"]["rows"] = dashboardConfigGridRows.val();
                socket.emit('admin-save-global-conf', globalConfig);
                resizeDashBoardGrid();
            });

            // display dashboard with modules previews
            var dashboardEl = el.find(".admin-dashboard-instances");
            resizeDashBoardGrid();
            dashboardEl.html(modulesDashboardTemplate({
                "modules": modules
            }));

            // enable drag over dashboard
            dashboardEl.bind("dragover", function(e) {
                if (e.preventDefault) {
                    e.preventDefault(); // allows us to drop
                }
                //this.className = 'over';
                e.originalEvent.dataTransfer.dropEffect = 'copy';
                return false;
            });

            // enable drop on dashboard
            dashboardEl.bind("drop", function(e) {
                if (e.stopPropagation) e.stopPropagation(); // stops the browser from redirecting...why???
                var moduleType = e.originalEvent.dataTransfer.getData('type');
                console.debug("drop a module of type " + moduleType);

                var moduleConfigPattern = modulesList.filter(function (mod) {
                    return mod.type === moduleType;
                });

                if (moduleConfigPattern.length > 0) {
                    el.addClass("fade");
                    var position = computeGridPosition(dashboardEl.width(), dashboardEl.height(), e.originalEvent.offsetX, e.originalEvent.offsetY);
                    var moduleConfig = new Office.ModuleConfig($("body"), moduleConfigPattern[0], moduleConfigTemplate, position, socket);
                    moduleConfig.displayModuleConfForm(function() {
                        el.removeClass("fade");
                    });
                }
            });

            // prevent drop on existing modules
            dashboardEl.find(".module-instance").bind("dragover", function(e) {
                e.stopImmediatePropagation();
                e.originalEvent.dataTransfer.dropEffect = 'none';
                return false;
            });

            // Listener - click on administrate button and display modal
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

            // Listener - click on delete button
            el.find(".admin-dashboard-instances .module-instance input.delete").click(function() {
                var id = $(this).parent().attr("id");
                el.addClass("fade");
                var moduleDelete = new Office.ModuleDelete($("body"), id, moduleDeleteTemplate, socket);
                moduleDelete.displayModuleDeleteForm(function() {
                    el.removeClass("fade");
                });
            });
        });

        socket.on('disconnect', function () {
            console.log("Admin got disconnected");
            el.unbind();
            el.find("*").unbind();
        });
    }
);