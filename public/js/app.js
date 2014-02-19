define(["jquery", "underscore", "socket-io", "constants"], function($, _, io) {

    var modules = [];
    var socket = io.connect(window.office.node_server_url);
    socket.on('connect', function () {
        socket.emit('get-config');
    });

    socket.on('config', function (config) {
        console.debug('Config', config);
        config['modules'].forEach(function(moduleConfig) {
            // Instanciate the module if it hasn't been yet
            var exist = false;
            if(modules.length > 0) {
                exist = _.filter(modules.config,function(config) {
                    return (config.id === moduleConfig.id);
                }); 
            }

            if(!exist){
                require(["modules/" + moduleConfig['type'] + "/frontend"], function(Module) {
                    var module= new Module(moduleConfig, $("#modules"));
                    modules.push(module);
                });
            }
        });
    });
});