define(["underscore", "jquery", "socket-io", "storage", "helpers", "hbs!templates/module-administration"],
    function (_, $, socketio, Storage, helpers, adminTemplate) {
        var Office = {};

        // Extend function - Backbone style
        var extend = function (protoProps, staticProps) {
            var parent = this;
            var child;

            // The constructor function for the new subclass is either defined by you
            // (the "constructor" property in your `extend` definition), or defaulted
            // by us to simply call the parent's constructor.
            if (protoProps && protoProps.hasOwnProperty('constructor')) {
                child = protoProps.constructor;
            } else {
                child = function () {
                    return parent.apply(this, arguments);
                };
            }

            // Add static properties to the constructor function, if supplied.
            _.extend(child, parent, staticProps);

            // Set the prototype chain to inherit from `parent`, without calling
            // `parent`'s constructor function.
            var Surrogate = function () {
                this.constructor = child;
            };
            Surrogate.prototype = parent.prototype;
            child.prototype = new Surrogate;

            // Add prototype properties (instance properties) to the subclass,
            // if supplied.
            if (protoProps) _.extend(child.prototype, protoProps);

            // Set a convenience property in case the parent's prototype is needed
            // later.
            child.__super__ = parent.prototype;

            return child;
        };


        /*
         * front module prototype
         */
        var Module = Office.Module = function () {
            this.initialize.apply(this, arguments);
        };
        _.extend(Module.prototype, {
            socket: null,
            rootEl: null,
            el: null,
            id: null,

            initialize: function (config, rootEl, socket) {
                this.rootEl = rootEl;
                this.config = config;
                this.id = config["id"];
                this.updateFormat = "HH:mm:ss";

                // Socket init & listen
                this.socket = socket;
                this.socket.on(Events.DISCONNECT, this.disconnect.bind(this));

                console.info("[" + this.config["id"] + "] module started");

                // load css
                helpers.loadModuleCss(this.config["type"]);

                if (this.el === null) {
                    // module container : cell of the grid
                    var container = $("<div/>", {
                        "id": this.config["id"],
                        "class": "module " + this.config["type"]
                    });

                    // inner contains the real content
                    container.append($("<div/>", {
                        "class": "module-inner " + this.config["type"]
                    }));

                    // regular module
                    if(!config["dock"]) {
                        // add it to center area
                        this.rootEl.append(container);
                    }
                    // docked module
                    else {
                        if(config["dock"] === "top") {
                            $(".center").css("height", "95%");
                            $(".center").css("top", $(".top").height() + "px");
                            $(".top").html(container);
                        }
                        else if(config["dock"] === "bottom") {
                            $(".center").css("height", "95%");
                            $(".bottom").html(container);
                        }
                        else {
                            console.warn("docking mode unknown : " + config["dock"]);
                        }
                    }

                    // save module dom element
                    this.el = $("div#" + this.config["id"] + " div.module-inner");

                    // add loading image to el
                    this.el.html($("<img/>", {
                        "class": "loading",
                        "src": "/images/loading.gif",
                        "alt": "Module is loading..."
                    }));

                    // position module inside the grid
                    this.updatePosition();
                }

                this.listen.apply(this);
            },

            updateConfig: function (config) {
                this.config = config;
                this.updatePosition();
                this.socket.emit(this.config["id"] + ":screen");
            },

            updatePosition: function () {
                var container = this.el.parent();

                // using grid layout
                container.css("grid-column-start", String(this.config["position"]["x"]));
                container.css("grid-column-end", "span " + this.config["size"]["w"]);
                container.css("grid-row-start", String(this.config["position"]["y"]));
                container.css("grid-row-end", "span " + this.config["size"]["h"]);

                // gridster fallback
                container.attr("data-col", String(this.config["position"]["x"]));
                container.attr("data-sizex", String(this.config["size"]["w"]));
                container.attr("data-row", String(this.config["position"]["y"]));
                container.attr("data-sizey", String(this.config["size"]["h"]));
            },

            alert: function(duration) {
                if(this.config["alert"] === "true") {
                    if(!duration) {
                        duration = 10;
                    }

                    var container = this.el.parent()
                    container.css("background-color", "red");
                    if(this.alertTimer) {
                        clearTimeout(this.alertTimer);
                    }
                    this.alertTimer = setTimeout(function() {
                        container.css("background-color", "transparent");
                    }, duration * 1000);
                }
            },

            destroy: function () {
                if(this.alertTimer) {
                    clearTimeout(this.alertTimer);
                }
                if(this.config["dock"]) {
                    $(".center").css("height", "100%");
                    $(".center").css("top", "0");
                }
                this.el.parent().remove();
                this.disconnect.apply(this);
            },

            disconnect: function () {
                this.dispose.apply(this);
            },

            listen: function () {
            },

            dispose: function () {
            }
        });
        Module.extend = extend;


        /*
         * Administration module
         */
        var AdminModule = Office.AdminModule = function () {
            this.initialize.apply(this, arguments);
        };
        _.extend(AdminModule.prototype, {
            socket: null,
            rootEl: null,
            el: null,
            context: {},

            initialize: function (config, rootEl, socket, doneCallback) {
                this.config = config;
                this.rootEl = rootEl;
                this.doneCallback = doneCallback;

                // Socket init & listen
                this.socket = socket;
                this.socket.on(Events.DISCONNECT, this.disconnect.bind(this));

                // Check if we are creating a new object or modifying an existing one
                var isNew = false;
                if (!this.config["id"]) isNew = true;
                if (isNew) {
                    this.config["id"] = this.config["type"] + "-" + Math.floor((Math.random() * 10000) + 1);
                }

                // load css
                helpers.loadAdminModuleCss(this.config["type"]);

                // Create add/configuration modal
                var modalTitle = "";
                if (isNew) {
                    modalTitle = "Create new " + this.config["type"] + " module";
                } else {
                    modalTitle = "Configure " + this.config["id"] + " module";
                }
                if (this.el === null) {
                    this.rootEl.append(adminTemplate({
                        "id": this.config["id"],
                        "type": this.config["type"],
                        "title": modalTitle,
                        "label": this.config["label"],
                        "alert": this.config["alert"]
                    }));
                    this.el = this.rootEl.find("div#" + this.config["id"] + " .module-admin-box");
                }

                // Render
                this.render();
                require(["hbs!modules/" + this.config["type"] + "/admin/admin"], (function (template) {
                    var context = this.context;
                    context.config = this.config;
                    this.el.find(".row:last-of-type").after(template(context));

                    // Register DOM events
                    this.events.apply(this);
                }).bind(this));

                // Register SocketIO events
                this.listen.apply(this);

                // Listener for submit event
                this.el.submit(this.addOrUpdate.bind(this));

                // Listener for close event
                this.rootEl.find(".close-modal").click((function () {
                    this.close();
                }).bind(this));

                console.info("[" + this.config["id"] + "] Admin module started");
            },

            // Generic create module / Works for simple input text fields
            addOrUpdate: function () {
                var inputs = this.el.find(".persist");
                var newConf = this.config;
                for (var i = 0; i < inputs.length; i++) {
                    var input = $(inputs[i]);
                    switch(input.attr("type")) {
                        case "checkbox":
                            newConf[input.attr("name")] = input.is(":checked").toString();
                            break;
                        default:
                            newConf[input.attr("name")] = input.val();
                            break;
                    }
                }
                this.socket.emit(Events.ADMIN_ADD_OR_UPDATE_MODULE_INSTANCE, newConf);
                this.close();
                return false;
            },

            close: function () {
                this.el.find("button[type='button'].close-modal").unbind();
                this.el.find("form").unbind();
                this.el.remove();

                if (this.doneCallback) {
                    this.doneCallback.apply(this);
                }
            },

            disconnect: function () {
                this.dispose.apply(this);
            },

            listen: function () {
            },

            events: function () {
            },

            render: function () {
            },

            dispose: function () {
                this.el.remove();
            }
        });
        AdminModule.extend = extend;

        /*
         * module delete
         */
        var ModuleDelete = Office.ModuleDelete = function (rootEl, moduleId, template, socket) {
            this.rootEl = rootEl;
            this.moduleId = moduleId;
            this.template = template;
            this.socket = socket;
        }
        _.extend(ModuleDelete.prototype, {
            displayModuleDeleteForm: function (doneCallback) {
                this.doneCallback = doneCallback;
                this.rootEl.append(this.template({
                    "title": "Delete " + this.moduleId + " module ?"
                }));

                this.el = this.rootEl.find(".modal");
                this.el.find("button.button-confirm").click(this.confirm.bind(this));
                this.el.find("button.button-cancel").click(this.close.bind(this));
            },

            confirm: function () {
                this.socket.emit(Events.ADMIN_DELETE_MODULE_INSTANCE, this.moduleId);
                this.close();
                return false;
            },

            close: function () {
                this.el.find("button.button-confirm").unbind();
                this.el.find("button.button-cancel").unbind();
                this.el.remove();
                if (this.doneCallback) {
                    this.doneCallback();
                }
            }
        });

        return Office;
    }
);