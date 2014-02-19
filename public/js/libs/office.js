define(["underscore", "socket-io", "helpers"], function (_, socketio, helpers) {
    var Office = {};

    var Module = Office.Module = function () {
        this.initialize.apply(this, arguments);
    };

    _.extend(Module.prototype, {
        socket: null,
        rootEl: null,
        el: null,

        initialize: function (config, rootEl) {
            // socket init & listen
            this.socket = socketio.connect(window.office.node_server_url, { "force new connection": true });
            this.socket.on('disconnect', this.disconnect.bind(this));

            this.rootEl = rootEl;
            this.config = config;

            console.info("[" + this.config["id"] + "] module started");

            helpers.loadModuleCss(this.config["type"]);

            if (this.el === null) {
                this.rootEl.append($("<div/>", { "id": this.config["id"], "class": "module " + this.config["type"] }));
                this.el = this.rootEl.find("div#" + this.config["id"]);
            }

            this.listen.apply(this);
        },

        disconnect: function () {
            this.dispose.apply(this);
            if (this.el) {
                this.el.remove();
            }
        },

        listen: function () {},
        dispose: function () {}
    });

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

    Module.extend = extend;

    return Office;
});