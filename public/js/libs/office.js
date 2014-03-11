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
                this.socket = socket;
                this.id = config["id"];
                this.updateFormat = "HH:mm:ss";

                // Socket init & listen
                //this.socket = socketio.connect(window.office.node_server_url, { "force new connection": true });
                this.socket.on('disconnect', this.disconnect.bind(this));

                console.info("[" + this.config["id"] + "] module started");

                // load css
                helpers.loadModuleCss(this.config["type"]);

                if (this.el === null) {
                    // module container : cell of the grid
                    this.rootEl.append($("<div/>", {
                        "id": this.config["id"],
                        "class": "module"
                    }));
                    var container = this.rootEl.find("div#" + this.config["id"]);

                    // inner contains the real content
                    container.append($("<div/>", {
                        "class": "module-inner " + this.config["type"]
                    }));
                    this.el = container.find("div.module-inner");
                    this.updatePosition();
                }

                this.listen.apply(this);
            },

            updateConfig: function(config) {
                this.config = config;
                this.updatePosition();
            },

            updatePosition: function() {
                var container = this.el.parent();
                container.css("grid-column-start", String(this.config["position"]["x"]));
                container.css("grid-column-end", "span " + this.config["size"]["w"]);
                container.css("grid-row-start", String(this.config["position"]["y"]));
                container.css("grid-row-end", "span " + this.config["size"]["h"]);
            },
            
	        destroy: function() {
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

            initialize: function (config, rootEl, socket, doneCallback) {
                this.config = config;
                this.rootEl = rootEl;
                this.socket = socket;
                this.doneCallback = doneCallback;

                // Socket init & listen
                //this.socket = socketio.connect(window.office.node_server_url, { "force new connection": true });
                this.socket.on('disconnect', this.disconnect.bind(this));

                // Check if we are creating a new object or modifying an existing one
                var isNew = false;
                if(!this.config["id"]) isNew = true;
                if(isNew) this.config["id"] = this.config["type"] + "-" + Math.floor((Math.random()*1000)+1);

                // load css
                helpers.loadAdminModuleCss(this.config["type"]);

                // Create add/configuration modal
                var modalTitle = "";
                if(isNew) {
                    modalTitle = "Create new " + this.config["type"] + " module";
                } else {
                    modalTitle = "Configure " + this.config["id"] + " module";
                }
                if (this.el === null) {
                    this.rootEl.append(adminTemplate({ "id": this.config["id"], "type": this.config["type"], "title": modalTitle }));
                    this.el = this.rootEl.find("div#" + this.config["id"] + " form.admin-box");
                }

                // Render
                this.render();

                // Register SocketIO events
                this.listen.apply(this);

                // Register DOM events
                this.events();

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
                var inputs = this.el.find("input.persist");
                var newConf = this.config;
                for (var i = 0; i < inputs.length; i++) {
                    var input = $(inputs[i]);
                    if (input.attr("name").indexOf("size") !== 0) {
                        newConf[input.attr("name")] = input.val();
                    }
                }
                this.socket.emit('admin-add-or-update-module-instance', newConf);
                this.close();
                return false;
            },

            close: function () {
                this.el.find("button[type='button'].close-modal").unbind();
                this.el.find("form").unbind();
                this.el.remove();

                if (this.doneCallback) {
                    this.doneCallback();
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
    }
);