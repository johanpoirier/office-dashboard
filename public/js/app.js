define(["jquery", "underscore", "socket-io", "constants"], function ($, _, io) {
    var currentModules = [];

    var socket = io.connect(window.office.node_server_url);
    socket.on('connect', function () {
        socket.emit('front-get-modules-instances');
    });

    // On connect
    socket.on('front-send-modules-instances', function (modules) {
        // Destroy module instances
        currentModules.forEach(function(module,index) {
            var toDestroy = true;
            modules.forEach(function(moduleConfig) {
                if(moduleConfig.id === module.config.id) toDestroy = false;
            });
            if(toDestroy) {
                module.destroy();
                currentModules.splice(index,1);
            }
        });

        // Create new module instances
        modules.forEach(function (moduleConfig) {           
            // 'exist' indicates whether or not a module of the same type has already been instanciated 
            var exist = false;
            currentModules.forEach(function(module) {
                if(module.config.type === moduleConfig.type) exist = true;
            });

            // 'instanciated' indicates whether or not a module with the same id has already been instanciated 
            var instanciated = false;
            currentModules.forEach(function(module) {
                if(module.config.id === moduleConfig.id) exist = true;
            });

            // 'singleton' indicated wether or not this kind of module is allowed to instanciated several times within the same view
            var singleton = (typeof moduleConfig.singleton !== "undefined") ? moduleConfig.singleton : false;

            /* Instanciate the module if it hasn't been yet
            *  Only non-singleton modules with different ids can be instanciated several times
            */
            if (!instanciated && !(exist && singleton)) {
                // Instanciate front module
                require(["modules/" + moduleConfig['type'] + "/frontend"], function (Module) {
                    currentModules.push(new Module(moduleConfig, $("#modules"), socket));
                });
            }
        });
    });


    // Add new module
    socket.on('front-add-module-instance', function (moduleConfig) {
        console.log("received new module instance ", moduleConfig);
        // 'exist' indicates whether or not new module of the same type has already been instanciated 
        var exist = false;
        currentModules.forEach(function(module) {
            if(module.config.type === moduleConfig.type) exist = true;
        });

        // 'instanciated' indicates whether or not module with the same id has already been instanciated 
        var instanciated = false;
        currentModules.forEach(function(module) {
            if(module.config.id === moduleConfig.id) exist = true;
        });

        // 'singleton' indicated wether or not this kind of module is allowed to instanciated several times within the same view
        var singleton = (typeof moduleConfig.singleton !== "undefined") ? moduleConfig.singleton : false;

        /* Instanciate the module if it hasn't been yet
        *  Only non-singleton modules with different ids can be instanciated several times
        */
        if (!instanciated && !(exist && singleton)) {
            // Instanciate front module
            require(["modules/" + moduleConfig['type'] + "/frontend"], function (Module) {
                currentModules.push(new Module(moduleConfig, $("#modules"), socket));
            });
        }
    });
     
    // Delete existing module
    socket.on('front-delete-module-instance', function (moduleId) {
        console.log("delete module instance ", moduleId);
        // Destroy module instances
        var toDestroy = false;
        var indexDelete = null;
        currentModules.forEach(function(module,index) {
            if(moduleId=== module.config.id) {
                toDestroy = true;
                indexDelete = index;
            } 
        });
        if(toDestroy) {
            currentModules[indexDelete].destroy();
            currentModules.splice(indexDelete,1);
        }
    });

});