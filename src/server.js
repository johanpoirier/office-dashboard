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
 * Proxy settings
 */
var proxyOpt = process.argv.slice(2)[0];
if(!proxyOpt || proxyOpt === "false") {
    delete config["proxy_host"];
    delete config["proxy_port"];
}

// CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
}

// all environments
app.set('port', process.env.TEST_PORT || 8080);
app.use(express.favicon(path.join(__dirname, '../public/images/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(allowCrossDomain);
app.use(express.static(path.join(__dirname, '../public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//Routes
app.get('/', function (req, res) {
    res.sendfile(path.join(__dirname, '/../public/index.html'));
});
app.get('/admin', function (req, res) {
    res.sendfile(path.join(__dirname, '/../public/admin.html'));
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

    socket.on('get-modules', function () {
        console.log("Client requested modules");
        socket.emit('modules', DashboardConfig.getModulesConf());
    });

    socket.on('get-modules-instances', function () {
        console.log("Admin requested modules instances");
        socket.emit('modules-instances', DashboardConfig.getModulesConf());
    });

    socket.on('get-modules-list', function () {
        console.log("Admin requested modules list");
        socket.emit('modules-list', DashboardConfig.listAvailableModules());
    });

    socket.on('add-module-instance', function (moduleConfig) {
        console.log("Admin added a module instance");
        DashboardConfig.addModule(moduleConfig);
        DashboardConfig.loadModule(config, moduleConfig, io.sockets);
        socket.emit('modules-instances', DashboardConfig.getModulesConf());
    });

});