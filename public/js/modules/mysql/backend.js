var mysql = require('mysql');

var _config, _iosockets;
var connection;

exports.withConfig = function(cfg) {
    console.log("[mysql] module loaded");
    _config = cfg;
    connection = mysql.createConnection({
      host     : _config['host'],
      user     : _config['user'],
      password : _config['password'],
      database : _config['database'],
      dateStrings : "true"
    });
    return this;
}

exports.start = function(socketio) {
    connection.connect(function(err) {
        if (err) {
           throw err; 
       } else {
            console.log("[mysql] connection to mysql db established : " + _config['host']);
       }
    });
    
    var mysqlModule = this;
    _iosockets = socketio;
    _iosockets.on('connection', function (socket) {
        socket.on("mysql:screen", getData.bind(mysqlModule));
    });
    setInterval(getData.bind(this), _config['refresh']);
}

exports.getLatestBusinessMessages = function(callback) {
    if(_config['database'] != '' && _config['table'] != '') {
        var businessMessages = [];

        var fields = [];
        _config['fields'].forEach(function(field) {
            fields.push(field.field_table_name);
        });

        // Construct select query
        var queryString = 'SELECT ' + fields.join(',') + ' FROM ' + _config['table'];
        if(_config['query']){
            if(_config['query']['orderBy_fields']) queryString += ' ORDER BY ' + _config['query']['orderBy_fields'].join(',');
            if(_config['query']['orderBy_fields'] && _config['query']['orderBy_sort']) queryString += ' ' + _config['query']['orderBy_sort'];
        }
        queryString += ' LIMIT ' + _config['fetched_items'];

        // Play query
        connection.query(queryString , function(err, results) {
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
        _iosockets.emit("mysql:businessMessage", businessMessages);
    });
};
