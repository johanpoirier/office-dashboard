define(["underscore", "socket-io", "storage", "helpers"], function (_, socketio, Storage, helpers) {
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

    // 1- Definition of module prototype
    var Module = Office.Module = function () {
        this.initialize.apply(this, arguments);
    };
    _.extend(Module.prototype, {
        socket: null,
        rootEl: null,
        el: null,

        initialize: function (config, rootEl) {
            this.rootEl = rootEl;
            this.config = config;

            // socket init & listen
            this.socket = socketio.connect(window.office.node_server_url, { "force new connection": true });
            this.socket.on('disconnect', this.disconnect.bind(this));

            console.info("[" + this.config["id"] + "] module started");

            // load css
            helpers.loadModuleCss(this.config["type"]);

            if (this.el === null) {
                this.rootEl.append($("<div/>", { "id": this.config["id"], "class": "module " + this.config["type"] }));
                this.el = this.rootEl.find("div#" + this.config["id"]);
            }

            this.listen.apply(this);
        },

        disconnect: function () {
           this.dispose.apply(this);
        },

        listen: function () {},
        dispose: function () {}
    });
    Module.extend = extend;

    // 2- Definition of Admin prototype
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
                this.rootEl.append($("<div/>", { "id": this.config["id"] + "Admin", "class": "module-admin " + this.config["type"] }));
                this.el = this.rootEl.find("div#" + this.config["id"] + "Admin");
            }

            // Render
            this.render();

            // Register SocketIO events
            this.listen.apply(this);

            // Register DOM events
            this.events();

            console.info("[" + this.config["id"] + "] Admin module started");
        },

        disconnect: function () {
           this.dispose.apply(this);
        },
        listen: function() {},
        events: function() {},
        render: function() {},
        dispose: function () {}
    });
    AdminModule.extend = extend;

    return Office;
});