/**
 * Module dependencies.
 */
var express = require('express')
    , app = express()
    , server = require('http').createServer(app)
    , path = require('path')
    , io = require('socket.io').listen(server);

/**
 * Config
 */
var config = require(__dirname + '/../config/' + app.get('env') + '.json');

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
    res.sendfile(path.join(__dirname, '/../public/index.html'));
});

//Socket.io Config
io.set('log level', 1);

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

// Loading modules
var modules = [];
config['modules'].forEach(function(moduleConfig) {
    var OfficeModule = require('../public/js/modules/' + moduleConfig['type'] + '/backend');
    modules.push(new OfficeModule(moduleConfig, io.sockets));
});

//Socket.io Server
io.sockets.on('connection', function (socket) {
    socket.on('get-config', function () {
        console.log("Client requested config");
        socket.emit('config', config);
    });
});
