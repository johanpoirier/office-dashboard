define(["jquery", "underscore", "socket-io", "constants"], function($, _, io) {

    var modules= [];
    var socket = io.connect(window.office.node_server_url);
    socket.on('connect', function () {
        socket.emit('get-config');
    });

    socket.on('config', function (config) {
        config['modules'].forEach(function(moduleConfig) {
            // Instanciate the module if it hasn't been yet
            var exist = false;
            if(modules.length > 0) {
                exist = _.filter(modules.config,function(config) {
                    return (config.id === moduleConfig.id);
                }); 
            }

            if(!exist){
                // Instanciate admin module
                if(typeof moduleConfig['admin'] !== "undefined") {
                    require(["modules/" + moduleConfig['type'] + "/admin"], function(AdminModule) {
                        var module = new AdminModule(moduleConfig, $("#admin-modules"));
                        modules.push(module);
                    });
                }
            }
        });
    });
});