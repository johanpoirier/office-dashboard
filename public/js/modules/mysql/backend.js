var mysql = require('mysql');

var config, iosockets;
var connection;

exports.withConfig = function(cfg) {
    console.log("[mysql] module loaded");
    config = cfg;
    connection = mysql.createConnection({
      host     : config['host'],
      user     : config['user'],
      password : config['password'],
      database : config['database'],
      dateStrings : "true"
    });
    return this;
}

exports.start = function(socketio) {
    connection.connect(function(err) {
        if (err) {
           throw err; 
       } else {
            console.log("[mysql] connection to mysql db established : " + config['host']);
       }
    });
    
    var mysqlModule = this;
    iosockets = socketio;
    iosockets.on('connection', function (socket) {
        socket.on("mysql:screen", getData.bind(mysqlModule));
    });
    setInterval(getData.bind(this), config['refresh']);
}

exports.getLatestBusinessMessages = function(callback) {
    if(config['database'] != '' && config['table'] != '') {
        var businessMessages = [];

        connection.query('SELECT * FROM ' + config['table'] + " order by " + config['date_field'] + " desc limit " +  config['fetched_rows'] , function(err, results) {
            if(typeof err !== "undefined") {
                businessMessages = results;
                console.info("[mysql] " + businessMessages.length + " business messages - " + new Date());
            } else {
                console.error("[mysql] error while fetching rows");
            }
            if(callback) {
                callback(businessMessages);
            }
        });
    }
    else {
        console.warn('[mysql] module not configured');
        callback([]);
    }
};

var getData = function() {
    this.getLatestBusinessMessages(function(businessMessages) {
        iosockets.emit("mysql:businessMessage", businessMessages);
    });
};
