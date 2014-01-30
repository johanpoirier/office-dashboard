/**
 * Module dependencies.
 */
var express = require('express')
    , app = express()
    , server = require('http').createServer(app)
    , path = require('path')
    , io = require('socket.io').listen(server)
    , spawn = require('child_process').spawn;

/**
 * Config
 */
var config = require(__dirname + '/config/' + app.get('env') + '.json');

/**
 * Loading modules
 */
config['modules'].forEach(function(moduleConfig) {
    require('./libs/' + moduleConfig['id']).withConfig(moduleConfig);
});


// all environments
app.set('port', process.env.TEST_PORT || 8080);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//Routes
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

//Socket.io Config
io.set('log level', 1);

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

//Socket.io Server
io.sockets.on('connection', function (socket) {
    socket.on('get-config', function () {
        console.log("Client requested config");
        socket.emit('config', config);
    });
});