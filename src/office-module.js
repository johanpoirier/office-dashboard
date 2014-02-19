var util = require('util');

var OfficeModule = function(config, socketio) {
    this.config = config;
    console.log("[" + this.config["id"] + "] module loaded");

    this.iosockets = socketio;
    this.iosockets.on('connection', (function (socket) {
        socket.on(this.config["id"] + ":screen", this.getData.bind(this));
    }).bind(this));

    this.start.apply(this);
}

OfficeModule.prototype.start = function() {};
OfficeModule.prototype.getData = function() {};

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