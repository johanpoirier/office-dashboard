define(["jquery", "socket-io", "constants"], function($, io) {
    var socket = io.connect(window.office.node_server_url);
    socket.on('connect', function () {
        socket.emit('get-config');
    });

    socket.on('config', function (config) {
        console.debug('Config', config);

        config['modules'].forEach(function(moduleConfig) {
            require(["modules/" + moduleConfig['type'] + "/frontend"], function(Module) {
                new Module(moduleConfig, $("#modules"));
            });
        });
    });
});