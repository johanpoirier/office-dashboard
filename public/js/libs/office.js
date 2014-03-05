define(["underscore", "jquery", "socket-io", "storage", "helpers", "hbs!../js/templates/module-administration"],
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

        // 1- front module prototype
        var Module = Office.Module = function () {
            this.initialize.apply(this, arguments);
        };
        _.extend(Module.prototype, {
            socket: null,
            rootEl: null,
            el: null,

            initialize: function (config, rootEl, socket) {
                this.rootEl = rootEl;
                this.config = config;
                this.socket = socket;
                this.updateFormat = "HH:mm:ss";

                this.socket.on('disconnect', this.disconnect.bind(this));

                console.info("[" + this.config["id"] + "] module started");

                // load css
                helpers.loadModuleCss(this.config["type"]);

                if (this.el === null) {
                    // module container : cell of the grid
                    this.rootEl.append($("<div/>", {
                        "id": this.config["id"],
                        "class": "module",
                        "style": "grid-column-start:" + this.config["position"]["x"] + ";"
                            + "grid-column-end:span " + this.config["size"]["w"] + ";"
                            + "grid-row-start:" + this.config["position"]["y"] + ";"
                            + "grid-row-end:span " + this.config["size"]["h"] + ";"
                    }));
                    this.el = this.rootEl.find("div#" + this.config["id"]);

                    //
                    this.el.append($("<div/>", {
                        "class": "module-inner " + this.config["type"]
                    }));
                    this.el = this.el.find("div.module-inner");
                }

                this.listen.apply(this);
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

        // 2- module administration
        var AdminModule = Office.AdminModule = function () {
            this.initialize.apply(this, arguments);
        };
        _.extend(AdminModule.prototype, {
            socket: null,
            rootEl: null,
            el: null,

            initialize: function (config, rootEl) {
                this.rootEl = rootEl;
                this.config = config;

                // Socket init & listen
                this.socket = socketio.connect(window.office.node_server_url, { "force new connection": true });
                this.socket.on('disconnect', this.disconnect.bind(this));

                // Init module local storage
                this.storage = new Storage(this.config["id"]);

                // load css
                helpers.loadAdminModuleCss(this.config["type"]);

                if (this.el === null) {
                    this.rootEl.append(adminTemplate({ "id": this.config["id"], "type": this.config["type"] }));
                    this.el = this.rootEl.find("div#" + this.config["id"] + "Admin div.admin-box");
                }

                // Render
                this.render();

                // Register SocketIO events
                this.listen.apply(this);

                // Register DOM events
                this.events();

                console.info("[" + this.config["id"] + "] Admin module started");
            },
            close: function () {
                this.disconnect();
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


        // 3- module config
        var ModuleConfig = Office.ModuleConfig = function (rootEl, configPattern, template, socket) {
            this.rootEl = rootEl;
            this.configPattern = configPattern;
            this.template = template;
            this.socket = socket;
        }
        _.extend(ModuleConfig.prototype, {
            displayModuleConfForm: function (doneCallback) {
                this.doneCallback = doneCallback;
                var fields = [];
                for (var key in this.configPattern) {
                    if (key !== "type") {
                        fields.push({
                            "name": key,
                            "value": this.configPattern[key]
                        })
                    }
                }

                this.rootEl.append(this.template({
                    "title": "New " + this.configPattern.type + " module :",
                    "fields": fields
                }));

                this.el = this.rootEl.find(".modal");
                this.el.find("form").submit(this.createModule.bind(this));
                this.el.find("button.button-cancel").click(this.close.bind(this));
            },

            createModule: function () {
                var inputs = this.el.find("form input");
                var newConf = { "type": this.configPattern.type };
                for (var i = 0; i < inputs.length; i++) {
                    var input = $(inputs[i]);

                    // remove this if when drag & drop available
                    if (input.attr("name").indexOf("position") !== 0 && input.attr("name").indexOf("size") !== 0) {
                        newConf[input.attr("name")] = input.val();
                    }
                }
                newConf.position = {
                    "x": this.el.find("form input[name='positionX']").val(),
                    "y": this.el.find("form input[name='positionY']").val()
                }
                newConf.size = {
                    "w": this.el.find("form input[name='sizeW']").val(),
                    "h": this.el.find("form input[name='sizeH']").val()
                }

                this.socket.emit('admin-add-module-instance', newConf);

                this.close();

                return false;
            },

            close: function () {
                this.el.find("button.button-cancel").unbind();
                this.el.find("form").unbind();
                this.el.remove();

                if (this.doneCallback) {
                    this.doneCallback();
                }
            }
        });

        // 4- module delete
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
                this.socket.emit('admin-delete-module-instance', this.moduleId);
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
    });