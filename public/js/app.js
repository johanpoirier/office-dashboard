define(["jquery", "underscore", "socket-io", "constants"], function ($, _, io) {

    var moduleIds = [];
    var moduleTypes = [];

    var socket = io.connect(window.office.node_server_url);
    socket.on('connect', function () {
        socket.emit('get-config');
    });

    socket.on('config', function (config) {
        config['modules'].forEach(function (moduleConfig) {
            // Instanciate the module if it hasn't been yet
            // Only non-singleton modules with different ids can be instanciated several times
            var exist = _.contains(moduleTypes, moduleConfig.type);
            var instanciated = _.contains(moduleIds, moduleConfig.id);
            var singleton = (typeof moduleConfig.singleton !== "undefined") ? moduleConfig.singleton : false;

            if (!instanciated && !(exist && singleton)) {
                // Reference module instance
                moduleIds.push(moduleConfig['id']);
                moduleTypes.push(moduleConfig['type']);

                // Instanciate front module
                require(["modules/" + moduleConfig['type'] + "/frontend"], function (Module) {
                    new Module(moduleConfig, $("#modules"), socket);
                });
            }
        });
    });

});