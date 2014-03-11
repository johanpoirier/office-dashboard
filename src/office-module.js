var util = require('util');

var OfficeModule = function(globalConfig, moduleConfig, socketio, proxy) {
    this.proxy = proxy;
    this.globalConfig = globalConfig;
    this.config = moduleConfig;
    this.id = moduleConfig["id"];

    console.log("[" + this.config["id"] + "] module loaded");

    this.connectionListener = (function (socket) {
        console.log("[" + this.config["id"] + "] listen to screen and admin:screen");
        socket.on(this.config["id"] + ":screen", this.getData.bind(this));
        socket.on(this.config["id"] + "admin" + ":screen", this.getAdminData.bind(this));
    }).bind(this);

    this.iosockets = socketio;
    this.iosockets.on("connection",  this.connectionListener);

    this.start.apply(this);
}

OfficeModule.prototype.start = function() {};
OfficeModule.prototype.getData = function() {};
OfficeModule.prototype.getAdminData = function() {};
OfficeModule.prototype.destroy = function() {
    console.log("[" + this.config["id"] + "] destroy");
    this.iosockets.removeListener("connection", this.connectionListener);
    delete require.cache[require.resolve('../public/js/modules/' + this.config['type'] + '/backend')];
};

var copyProps = function(obj) {
    for(var index in arguments) {
        if (index > 0) {
            var source = arguments[index];
            for (var prop in source) {
                obj[prop] = source[prop];
            }
        }
    }
    return obj;
};

OfficeModule.extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
    } else {
        child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    copyProps(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) copyProps(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
};

module.exports = OfficeModule;