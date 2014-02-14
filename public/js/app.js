define(["jquery", "socket-io", "constants"], function($, io) {
    var socket = io.connect(window.office.node_server_url);
    socket.on('connect', function (data) {
        socket.emit('get-config');
    });

    socket.on('config', function (config) {
        console.info('Config', config);

        config['modules'].forEach(function(moduleConfig) {
            require(["modules/" + moduleConfig['id'] + "/frontend"], function(controller) {
                controller.start(moduleConfig, $("#modules"));
            });
        });
    });
});