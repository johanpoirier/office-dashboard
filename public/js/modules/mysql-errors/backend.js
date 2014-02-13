var mysql = require('mysql');

var config, iosockets;
var connection;

exports.withConfig = function(cfg) {
    console.log("[mysql-errors] module loaded");
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
            console.log("[mysql-errors] connection to mysql db established : " + config['host']);
       }
    });
    
    var mysqlErrorsModule = this;
    iosockets = socketio;
    iosockets.on('connection', function (socket) {
        socket.on("mysqlErrors:screen", getData.bind(mysqlErrorsModule));
    });
    setInterval(getData.bind(this), config['refresh']);
}

exports.getLatestBusinessErrors = function(callback) {
    if(config['database'] != '' && config['table'] != '') {
        var businessErrors = [];

        connection.query('SELECT * FROM ' + config['table'] + " order by " + config['date_field'] + " desc limit " +  config['fetched_rows'] , function(err, results) {
            if(typeof err !== "undefined") {
                businessErrors = results;
                console.info("[mysql-errors] " + businessErrors.length + " business errors - " + new Date());
            } else {
                console.error("[mysql-errors] error while fetching rows");
            }
            if(callback) {
                callback(businessErrors);
            }
        });
    }
    else {
        console.warn('[mysql-errors] module not configured');
        callback([]);
    }
};

var getData = function() {
    this.getLatestBusinessErrors(function(businessErrors) {
        iosockets.emit("mysqlErrors:businessErrors", businessErrors);
    });
};
