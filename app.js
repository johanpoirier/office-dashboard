/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()  
  , server = require('http').createServer(app)
  , path = require('path')
  , io = require('socket.io').listen(server)
  , spawn = require('child_process').spawn
  , http = require('http');


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

app.get('/remote', function (req, res) {
  res.sendfile(__dirname + '/public/remote.html');
});

//Socket.io Config
io.set('log level', 1);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var ss;

//Run and pipe shell script output
function run_shell(cmd, args, cb, end) {
    var spawn = require('child_process').spawn,
        child = spawn(cmd, args),
        me = this;
    child.stdout.on('data', function (buffer) { cb(me, buffer); });
    child.stdout.on('end', end);
}

//Socket.io Server
io.sockets.on('connection', function (socket) {

 socket.on("screen", function(data){
   socket.type = "screen";
   ss = socket;
   console.log("Screen ready...");
 });
 socket.on("remote", function(data){
   socket.type = "remote";
   console.log("Remote ready...");
 });

 socket.on("controll", function(data){
	console.log(data);
   if(socket.type === "remote"){

     if(data.action === "tap"){
         if(ss != undefined){
            ss.emit("controlling", {action:"enter"});
            }
     }
     else if(data.action === "swipeLeft"){
      if(ss != undefined){
          ss.emit("controlling", {action:"goLeft"});
          }
     }
     else if(data.action === "swipeRight"){
       if(ss != undefined){
           ss.emit("controlling", {action:"goRight"});
           }
     }
   }
 });
});


//Jenkins API call
var username = 'AtosWorldline';
var password = 'b7aaeecffefab859a3087625466cd69f';
var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
var optionsget = {
    host : 'preprod.meteo-integration.aw.atos.net',
    port : 80,
    path : '/api/json?tree=jobs[name,color]',
    method : 'GET',
    headers:{
      'Host': 'preprod.meteo-integration.aw.atos.net',
      'Authorization': auth
    }
};
 
// do the GET request
setInterval(function() {
   var reqGet = http.request(optionsget, function(res) {
       var data = "";
       res.on('data', function(d) {
           data += d;
       });
       res.on('end', function(d) {
           var jobs = JSON.parse(data).jobs;
           io.sockets.emit('jenkins', jobs.filter(function(job) { return job.color == "red"; })); 
       });
   });
    
   reqGet.end();
   reqGet.on('error', function(e) {
       console.error(e);
   });
}, 10000);