define(["jquery", "socket-io"], function($, io) {
    var socket = io.connect('http://localhost:8080');
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