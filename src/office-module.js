var util = require('util');

var OfficeModule = function(globalConfig, moduleConfig, socketio, proxy) {
    this.proxy = proxy;
    this.globalConfig = globalConfig;
    this.config = moduleConfig;
    this.id = moduleConfig["id"];
    this.listeners = [];

    this.iosockets = socketio;

    // common listeners
    this.registerSocketListener(this.config["id"] + ":screen", this.getData.bind(this));
    this.registerSocketListener(this.config["id"] + ":admin-screen", this.getData.bind(this));

    console.log("[" + this.config["id"] + "] module loaded");

    this.start.apply(this);
}

// add listener to a socket
var applyListener = function(context, socket, event, handler) {
    socket.on(event, function() {
        // we add the socket to the handler
        var args = [ socket ];
        for(var index in arguments) {
            args.push(arguments[index]);
        }
        handler.apply(context, args);
    });
}

// register a socket listener for the module backend
OfficeModule.prototype.registerSocketListener = function(event, handler) {
    this.listeners.push({ "event": event, "handler": handler });

    // apply each listener to each client
    this.iosockets.clients().forEach((function(socket) {
        applyListener(this, socket, event, handler);
    }).bind(this));
};

// new client with new socket : add listeners to the socket
OfficeModule.prototype.addClient = function(socket) {
    console.log("[" + this.config["id"] + "] new socket client", socket.id);
    this.listeners.forEach((function(eventHandler) {
        console.log("[" + this.config["id"] + "] apply socket listener for", eventHandler["event"]);
        applyListener(this, socket, eventHandler["event"], eventHandler["handler"]);
    }).bind(this));

    this.connect.call(this, socket);
};

// remove the node module from cache
OfficeModule.prototype.destroy = function() {
    console.log("[" + this.config["id"] + "] destroy");
    delete require.cache[require.resolve('../public/js/modules/' + this.config['type'] + '/backend')];
};

OfficeModule.prototype.reload = function(globalConfig, moduleConfig) {
    this.globalConfig = globalConfig;
    this.config = moduleConfig;
};

// when a new client connect
OfficeModule.prototype.connect = function(socket) {};

// when a new client disconnect
OfficeModule.prototype.disconnect = function(socket) {};

OfficeModule.prototype.start = function() {};
OfficeModule.prototype.getData = function() {};
OfficeModule.prototype.getAdminData = function() {};

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