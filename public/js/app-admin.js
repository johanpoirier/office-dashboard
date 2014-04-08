define(["jquery",
    "underscore",
    "socket-io",
    "office",
    "handlebars",
    "helpers",
    "admin/global-config",
    "admin/modules-kinds",
    "admin/grid-occupation",
    "hbs!templates/modules-dashboard",
    "hbs!templates/module-delete",
    "hbs!templates/modules-dashboard-module",
    "text!templates/modules-dashboard-module.hbs",
    "hbsCustomHelpers",
    "constants"],

    function ($, _, io,
              Office,
              Handlebars,
              Helpers,
              globalConfigManager, modulesKindsManager,
              gridOccupation,
              modulesDashboardTemplate, moduleDeleteTemplate, modulesDashboardModuleTemplate,
              modulesDashboardModuleTemplateRaw)
    {
        // DOM elements
        var el = $("#admin");
        var topEl = el.find(".top");
        var centerEl = el.find(".center");
        var bottomEl = el.find(".bottom");
        var dashboardEl = centerEl.find(".admin-dashboard-instances");
        var adminModule = null;  // reference to current admin module (modal window)

        var modulesInstances = [];

        Handlebars.registerPartial("dashboard-module", modulesDashboardModuleTemplateRaw);

        /*
         * grid cols & rows changes
         */
        globalConfigManager.listenToGridSizeChange(function () {
            socket.emit(Events.ADMIN_SAVE_GLOBAL_CONF, globalConfigManager.getConfig());
            gridOccupation.setGridSize(globalConfigManager.get("grid"));
            resizeDashBoardGrid();
        });


        /*
         *
         */
        var addModuleToGrid = function(type, position) {
            var moduleConstantConfig = modulesKindsManager.getByType(type);

            // we need to clone the config object in order to not alter our modulesList
            var moduleConstantConfigClone = _.clone(moduleConstantConfig);
            moduleConstantConfigClone["position"] = position;
            moduleConstantConfigClone["size"] = { "w": 1, "h": 1 }; // default size

            require(["modules/" + type + "/admin/admin"], function (AdminModule) {
                el.addClass("fade");
                adminModule = new AdminModule(moduleConstantConfigClone, $("body"), socket, function() {
                    el.removeClass("fade");
                    adminModule = null;
                    $(".module-admin").remove();
                });
            });
        };

        /*
         * Drag & Drop management : enable drop on dashboard
         */
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
                    addModuleToGrid(data["type"], position);
                }

                // move module instance inside the dashboard
                else if(data["operation"] === "move") {
                    var moduleId = data["id"];
                    var offset = data["offset"];

                    // apply offset from inside module click coordinates
                    if(offset) {
                        position["x"] -= offset["x"];
                        position["y"] -= offset["y"];
                    }

                    if(position["x"] < 1) {
                        position["x"] = 1;
                    }
                    if(position["y"] < 1) {
                        position["y"] = 1;
                    }

                    // update the module instance conf
                    var moduleConfig = getModule(moduleId);
                    if(moduleConfig) {
                        moduleConfig["position"] = position;
                    }
                    else {
                        console.debug("module not found");
                    }

                    // push the conf to the server
                    socket.emit(Events.ADMIN_ADD_OR_UPDATE_MODULE_INSTANCE, moduleConfig);
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
            socket.emit(Events.ADMIN_GET_GLOBAL_CONF);
        });

        socket.on(Events.ADMIN_SEND_GLOBAL_CONF, function (config) {
            globalConfigManager.setConfig(config);
            gridOccupation.setGridSize(globalConfigManager.get("grid"));
            resizeDashBoardGrid();

            socket.emit(Events.ADMIN_GET_MODULE_KINDS);
            socket.emit(Events.ADMIN_GET_MODULE_INSTANCES);
        });

        socket.on(Events.ADMIN_SEND_MODULE_KINDS, function (modules) {
            console.log("admin received modules kinds");
            modulesKindsManager.setModulesList(modules);
            modulesKindsManager.listenToDragOperation();

            // Handle singleton add by click on + buttons
            modulesKindsManager.setAddSingletonHandler(function(e) {
                var type = $(e.target).data("type");
                addModuleToGrid(type, {});
            });
        });

        socket.on(Events.ADMIN_SEND_MODULE_INSTANCES, function (modules) {
            console.log("admin received modules instances");
            modulesInstances = modules;
            modulesKindsManager.setSingletonsList(modules.filter(function(mod) {
                return mod["singleton"];
            }).map(function(mod) {
                    return mod["type"];
                })
            );

            // display dashboard with regular modules previews
            dashboardEl.html(modulesDashboardTemplate({
                "modules": modules.filter(function(module) {
                    return !module["dock"];
                })
            }));
            gridOccupation.setModulesInstances(modules);

            // docked modules
            centerEl.css("height", "100%");
            centerEl.css("top", "0");
            topEl.html("");
            bottomEl.html("");
            modules.forEach(function(module) {
                if(module["dock"]) {
                    if(module["dock"] === "top") {
                        topEl.html(modulesDashboardModuleTemplate(module));
                        centerEl.css("height", "90%");
                        centerEl.css("top", topEl.height() + "px");
                    }
                    else if(module["dock"] === "bottom") {
                        bottomEl.html(modulesDashboardModuleTemplate(module));
                        centerEl.css("height", "90%");
                    }
                }
            });

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
                        if(size["w"] <= 0) {
                            size["w"] = 1;
                        }
                    }
                    if(dragOffsetY < 10) {
                        size["h"] = Math.round((e.originalEvent.offsetY + dragOffsetY) / unitHeight);
                        if(size["h"] <= 0) {
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
                    socket.emit(Events.ADMIN_ADD_OR_UPDATE_MODULE_INSTANCE, moduleConfig);

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
                var mod = $(e.target).parent();
                mod.addClass("move");

                // compute local module click x/y
                var startX = e.originalEvent.pageX - mod.position()["left"];
                var startY = e.originalEvent.pageY - mod.position()["top"];
                var insidePosition = computeGridPosition(mod.data("w"), mod.data("h"), mod.width(), mod.height(), startX, startY);
                var offset = {
                    "x": insidePosition["x"] - 1,
                    "y": insidePosition["y"] - 1
                }
                mod.data("offsetX", offset["x"]);
                mod.data("offsetY", offset["y"]);

                e.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({
                    "id": mod.attr("id"),
                    "operation": "move",
                    "offset": offset
                }));
            });
            instancesInnerEl.unbind("dragend");
            instancesInnerEl.bind("dragend", function (e) {
                var mod = $(e.target);
                mod.removeClass("move");
            });

            // Listener - click on administrate button and display modal
            var adminButtons = el.find(".module button.admin");
            adminButtons.unbind("click");
            adminButtons.click(function () {
                if (!adminModule) {
                    var type = $(this).parents("div.module").data("type");
                    var id = $(this).parents("div.module").attr("id");

                    var moduleConfig = getModule(id);
                    if (moduleConfig) {
                        require(["modules/" + type + "/admin/admin"], function (AdminModule) {
                            el.append($("<div/>", { "class": "fade" }));
                            adminModule = new AdminModule(moduleConfig, $("body"), socket, function() {
                                el.find(".fade").remove();
                                adminModule = null;
                                $(".module-admin").remove();
                            });
                        });
                    }
                    else {
                        console.warn("no admin for " + type + " module");
                    }
                }
            });

            // Listener - click on delete button
            var deleteButtons = el.find(".module button.delete");
            deleteButtons.unbind("click");
            deleteButtons.click(function (e) {
                var id = $(this).parents("div.module").attr("id");
                el.append($("<div/>", { "class": "fade" }));
                var moduleDelete = new Office.ModuleDelete($("body"), id, moduleDeleteTemplate, socket);
                moduleDelete.displayModuleDeleteForm(function () {
                    el.find(".fade").remove();
                });
            });
        });

        socket.on(Events.DISCONNECT, function () {
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

        var computeGridPosition = function (columns, rows, width, height, x, y) {
            var gridX = Math.ceil((x / width) * columns);
            var gridY = Math.ceil((y / height) * rows);
            return {
                "x": gridX > 0 ? gridX : 1,
                "y": gridY > 0 ? gridY : 1
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