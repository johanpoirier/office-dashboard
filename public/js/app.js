define(["jquery", "socket-io"], function($, io) {
    var socket = io.connect('http://10.40.244.6:8080');
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