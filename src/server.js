/**
 * Module dependencies.
 */
var express = require('express')
    , app = express()
    , server = require('http').createServer(app)
    , path = require('path')
    , io = require('socket.io').listen(server)
    , DashboardConfig = require(__dirname + '/dashboard-config.js');

/**
 * Config
 */
var config = require(__dirname + '/../config/' + app.get('env') + '.json');

/**
 * Global socket.io events
 */
require(__dirname + '/../' + config['app'] + '/js/events.js')


// CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
}

// all environments
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.TEST_PORT || 8080);
app.use(express.favicon(path.join(__dirname, '../' + config['app'] + '/images/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(allowCrossDomain);
app.use(express.static(path.join(__dirname, '../' + config['app'])));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//Routes
app.get('/', function (req, res) {
    res.sendfile(path.join(__dirname, '/../' + config['app'] + '/index.html'));
});
app.get('/admin', function (req, res) {
    res.sendfile(path.join(__dirname, '/../' + config['app'] + '/admin.html'));
});

//Socket.io Config
io.set('log level', 1);

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

// Loading modules
DashboardConfig.init(config);
var modulesConf = DashboardConfig.getModulesConf();
modulesConf.forEach(function(moduleConfig) {
    DashboardConfig.loadModule(config, moduleConfig, io.sockets);
});

// Socket.io Server
io.sockets.on('connection', function (socket) {
    // Add modules listeners
    DashboardConfig.addNewClient(socket);

    // Client event listeners
    socket.on(Events.FRONT_GET_MODULES_INSTANCES, function () {
        console.log("Client requested modules");
        socket.emit(Events.FRONT_SEND_MODULES_INSTANCES, DashboardConfig.getModulesConf());
    });

    socket.on(Events.FRONT_GET_GLOBAL_CONF, function () {
        console.log("Client requested global conf");
        socket.emit(Events.FRONT_SEND_GLOBAL_CONF, DashboardConfig.getGlobalConf());
    });


    // Admin event listeners
    socket.on(Events.ADMIN_GET_GLOBAL_CONF, function () {
        console.log("Admin requested global conf");
        socket.emit(Events.ADMIN_SEND_GLOBAL_CONF, DashboardConfig.getGlobalConf());
    });

    socket.on(Events.ADMIN_SAVE_GLOBAL_CONF, function (config) {
        console.log("Admin pushed global conf");
        DashboardConfig.saveGlobalConf(config);

        // bradcast global conf to front clients
        socket.broadcast.emit(Events.FRONT_SEND_GLOBAL_CONF, config);
    });

    socket.on(Events.ADMIN_GET_MODULE_KINDS, function () {
        console.log("Admin requested modules kinds");
        socket.emit(Events.ADMIN_SEND_MODULE_KINDS, DashboardConfig.listAvailableModules());
    });

    socket.on(Events.ADMIN_GET_MODULE_INSTANCES, function () {
        console.log("Admin requested modules instances");
        socket.emit(Events.ADMIN_SEND_MODULE_INSTANCES, DashboardConfig.getModulesConf());
    });

    socket.on(Events.ADMIN_ADD_OR_UPDATE_MODULE_INSTANCE, function (moduleConfig) {
        console.log("Admin pushed a module instance " + moduleConfig["id"]);
        var modules = DashboardConfig.addOrUpdateModule(moduleConfig);
        DashboardConfig.loadModule(config, moduleConfig, io.sockets);

        // send back modules instances to admin
        socket.emit(Events.ADMIN_SEND_MODULE_INSTANCES, modules);

        // broadcast new module instance to front socket
        socket.broadcast.emit(Events.FRONT_ADD_MODULE_INSTANCE, moduleConfig);
    });

    socket.on(Events.ADMIN_DELETE_MODULE_INSTANCE, function (moduleId) {
        console.log("Admin deleted a module instance " + moduleId);
        var modules = DashboardConfig.deleteModule(moduleId);
        // send back modules instances to admin
        socket.emit(Events.ADMIN_SEND_MODULE_INSTANCES, modules);
        // broadcast module instance to delete id to front socket
        socket.broadcast.emit(Events.FRONT_DELETE_MODULE_INSTANCE, moduleId);
    });

    socket.on(Events.DISCONNECT, function () {
        // Add modules listeners
        DashboardConfig.disconnectModules(socket);
        console.log("client " + socket.id + " got disconnected");
    });
});

