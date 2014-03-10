define(["jquery",
    "underscore",
    "socket-io",
    "office",
    "helpers",
    "admin/global-config",
    "admin/modules-kinds",
    "admin/grid-occupation",
    "hbs!templates/modules-dashboard",
    "hbs!templates/module-conf",
    "hbs!templates/module-delete",
    "hbsCustomHelpers",
    "constants"],

    function ($, _, io, Office, Helpers, globalConfigManager, modulesKindsManager, gridOccupation, modulesDashboardTemplate, moduleConfigTemplate, moduleDeleteTemplate) {
        // DOM elements
        var el = $("#admin");
        var dashboardEl = el.find(".admin-dashboard-instances");
        var adminModule = null;  // reference to current admin module (modal window)

        var modulesInstances = [];

        /*
         * grid cols & rows changes
         */
        globalConfigManager.listenToGridSizeChange(function () {
            socket.emit('admin-save-global-conf', globalConfigManager.getConfig());
            gridOccupation.setGridSize(globalConfigManager.get("grid"));
            resizeDashBoardGrid();
        });


        /*
         * Drag & Drop management
         */
        // enable drop on dashboard
        gridOccupation.listenToDrop(function(e, data) {
            if (data["operation"]) {
                var targetCell = $(e.target);
                var position = {
                    "x": targetCell.data("x"),
                    "y": targetCell.data("y")
                }

                // add a new module to the dashboard
                if (data["operation"] === "add") {
                    console.debug("drop a module of type " + data["type"]);

                    var moduleConfigPattern = modulesKindsManager.getByType(data["type"]);

                    if (moduleConfigPattern) {
                        el.addClass("fade");
                        var moduleConfig = new Office.ModuleConfig($("body"), moduleConfigPattern, moduleConfigTemplate, position, socket);
                        moduleConfig.displayModuleConfForm(function () {
                            el.removeClass("fade");
                        });
                    }
                }

                // move module instance inside the dashboard
                else if(data["operation"] === "move") {
                    var moduleId = data["id"];
                    console.debug("move the module " + moduleId + " to ", position);

                    // update the module instance conf
                    var moduleConfig = getModule(moduleId);
                    if(moduleConfig) {
                        moduleConfig["position"] = position;
                    }
                    else {
                        console.debug("module not found");
                    }

                    // push the conf to the server
                    socket.emit('admin-add-module-instance', moduleConfig);
                }

                // move module instance inside the dashboard
                else if(data["operation"] === "resize") {
                    // do nothing
                }
            }
            else {
                console.debug("no operation to perform");
            }
        });


        /*
         * Web Socket events
         */
        var socket = io.connect(window.office.node_server_url);
        socket.on('connect', function () {
            socket.emit('admin-get-global-conf');
        });

        socket.on('admin-send-global-conf', function (config) {
            globalConfigManager.setConfig(config);
            gridOccupation.setGridSize(globalConfigManager.get("grid"));
            resizeDashBoardGrid();

            socket.emit('admin-get-modules-kinds');
            socket.emit('admin-get-modules-instances');
        });

        socket.on('admin-send-modules-kinds', function (modules) {
            console.log("admin received modules kinds");
            modulesKindsManager.setModulesList(modules);
            modulesKindsManager.listenToDragOperation();
        });

        socket.on('admin-send-modules-instances', function (modules) {
            console.log("admin received modules instances");
            modulesInstances = modules;

            // display dashboard with modules previews
            dashboardEl.html(modulesDashboardTemplate({
                "modules": modules
            }));
            gridOccupation.setModulesInstances(modules);

            // resize cursor hover of module borders
            var instancesEl = dashboardEl.find(".module");
            instancesEl.bind("mouseover", function (e) {
                var mod = $(e.target);
                if(mod.hasClass("module")) {
                    if(e.originalEvent.offsetX >= (mod.width() - 10)) {
                        mod.css("cursor", "w-resize");
                    }
                    else if(e.originalEvent.offsetY >= (mod.height() - 10)) {
                        mod.css("cursor", "n-resize");
                    }
                }
            });

            // we use drag n drop for module resize
            var dragIcon = window.document.getElementById("resize");
            var dragOffsetX = 0, dragOffsetY = 0;
            var modWidth = 0, modHeight = 0;
            var unitWidth = 0, unitHeight = 0;
            instancesEl.bind("dragstart", function (e) {
                var mod = $(e.target);
                if(mod.hasClass("module")) {
                    e.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({
                        "id": $(this).attr("id"),
                        "operation": "resize"
                    }));

                    mod.addClass("resize");

                    e.originalEvent.dataTransfer.setDragImage(dragIcon, -10, -10);

                    modWidth = mod.width();
                    modHeight = mod.height();
                    unitWidth = dashboardEl.width() / globalConfigManager.get("grid")["columns"];
                    unitHeight = Math.round(modHeight / mod.data("h"));
                    dragOffsetX = modWidth - e.originalEvent.offsetX;
                    dragOffsetY = modHeight - e.originalEvent.offsetY;
                }
            });

            // live resizing
            instancesEl.bind("drag", function (e) {
                var mod = $(e.target);
                if(mod.hasClass("module") && mod.hasClass("resize")) {
                    if(dragOffsetX < 10) {
                        mod.width(e.originalEvent.offsetX + dragOffsetX);
                    }
                    if(dragOffsetY < 10) {
                        mod.height(e.originalEvent.offsetY + dragOffsetY);
                    }
                }
            });

            // we compute new size and push the size to the backend
            instancesEl.bind("dragend", function (e) {
                var mod = $(e.target);
                if(mod.hasClass("module") && mod.hasClass("resize")) {
                    mod.removeClass("resize");
                    var size = {};

                    // compute new size dimensions
                    if(dragOffsetX < 10) {
                        size["w"] = Math.round((e.originalEvent.offsetX + dragOffsetX) / unitWidth);
                        if(size["w"] == 0) {
                            size["w"] = 1;
                        }
                    }
                    if(dragOffsetY < 10) {
                        size["h"] = Math.round((e.originalEvent.offsetY + dragOffsetY) / unitHeight);
                        if(size["h"] == 0) {
                            size["h"] = 1;
                        }
                    }

                    // complete size missing dimension of module
                    if(!size["w"]) {
                        size["w"] = mod.data("w");
                    }
                    if(!size["h"]) {
                        size["h"] = mod.data("h");
                    }

                    // set new module size
                    var moduleConfig = getModule(mod.attr("id"));
                    if(moduleConfig) {
                        moduleConfig["size"] = size;
                    }
                    else {
                        console.debug("module not found");
                    }

                    // push the conf to the server
                    socket.emit('admin-add-module-instance', moduleConfig);

                    // reset temp vars
                    dragOffsetX = dragOffsetY = modWidth = modHeight = unitWidth = unitHeight = 0;
                }
            });

            // prevent drop on existing modules
            var instancesInnerEl = dashboardEl.find(".module-inner");
            instancesInnerEl.unbind("dragover");
            instancesInnerEl.bind("dragover", function (e) {
                e.stopImmediatePropagation();
                e.originalEvent.dataTransfer.effectAllowed = 'none';
                e.originalEvent.dataTransfer.dropEffect = 'none';
                return false;
            });

            // enable drag of module instances
            instancesInnerEl.unbind("dragstart");
            instancesInnerEl.bind("dragstart", function (e) {
                e.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({
                    "id": $(this).parent().attr("id"),
                    "operation": "move"
                }));
                console.info("set data transfer on dragstart", e.originalEvent.dataTransfer.getData("text/plain"));
            });

            // Listener - click on administrate button and display modal
            var adminButtons = el.find(".admin-dashboard-instances .module input.admin");
            adminButtons.unbind("click");
            adminButtons.click(function () {
                if (!adminModule) {
                    var type = $(this).parent().data("type");
                    var id = $(this).parent().attr("id");

                    var moduleConfig = getModule(id);
                    if (moduleConfig && moduleConfig.admin !== undefined) {
                        require(["modules/" + type + "/admin"], function (AdminModule) {
                            el.addClass("fade");
                            adminModule = new AdminModule(moduleConfig, $("body"));
                            /* Listener - click on close button and hide administration modal */
                            $(".module-admin .close-modal").click((function () {
                                el.removeClass("fade");
                                adminModule.close();
                                adminModule = null;
                                $(".module-admin").remove();
                            }).bind(this));
                        });
                    }
                    else {
                        console.warn("no admin for " + type + " module");
                    }
                }
            });

            // Listener - click on delete button
            var deleteButtons = el.find(".admin-dashboard-instances .module input.delete");
            deleteButtons.unbind("click");
            deleteButtons.click(function () {
                var id = $(this).parent().parent().attr("id");
                el.addClass("fade");
                var moduleDelete = new Office.ModuleDelete($("body"), id, moduleDeleteTemplate, socket);
                moduleDelete.displayModuleDeleteForm(function () {
                    el.removeClass("fade");
                });
            });
        });

        socket.on('disconnect', function () {
            console.log("Admin got disconnected");
            el.unbind();
            el.find("*").unbind();
        });


        /*
         * useful functions
         */
        var resizeDashBoardGrid = function () {
            var dashboardInstances = el.find(".admin-dashboard-instances");
            var gridConfig = globalConfigManager.get("grid");
            dashboardInstances.css("grid-template-columns", Helpers.generateGridTemplateProperty(gridConfig["columns"]));
            dashboardInstances.css("grid-template-rows", Helpers.generateGridTemplateProperty(gridConfig["rows"]));
        };

        var computeGridPosition = function (width, height, x, y) {
            var gridConfig = globalConfigManager.get("grid");
            return {
                "x": Math.ceil((x / width) * gridConfig["columns"]),
                "y": Math.ceil((y / height) * gridConfig["rows"])
            }
        };

        var getModule = function(id) {
            var module = modulesInstances.filter(function (mod) {
                return mod.id === id;
            });
            return (module.length > 0 ? module[0] : null);
        }
    }
);