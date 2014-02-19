var OfficeModule = require(__dirname + "/../../../../src/office-module"),
    mysql = require('mysql');

var MySqlModule = OfficeModule.extend({

    connection: null,

    start: function () {
        this.connection = mysql.createConnection({
            host: this.config['host'],
            user: this.config['user'],
            password: this.config['password'],
            database: this.config['database'],
            dateStrings: "true"
        });

        this.connection.connect(function (err) {
            if (err) {
                throw err;
            } else {
                //console.log("[mysql] connection to mysql db established : " + this.config['host']);
            }
        });

        setInterval(this.getData.bind(this), this.config['refresh']);
    },

    getData: function () {
        this.getLatestBusinessMessages((function (businessMessages) {
            this.iosockets.emit("mysql:businessMessage", businessMessages);
        }).bind(this));
    },

    getLatestBusinessMessages: function (callback) {
        if (this.config['database'] != '' && this.config['table'] != '') {
            var businessMessages = [];

            var fields = [];
            this.config['fields'].forEach(function (field) {
                fields.push(field.field_table_name);
            });

            // Construct select query
            var queryString = 'SELECT ' + fields.join(',') + ' FROM ' + this.config['table'];
            if (this.config['query']) {
                if (this.config['query']['orderBy_fields']) queryString += ' ORDER BY ' + this.config['query']['orderBy_fields'].join(',');
                if (this.config['query']['orderBy_fields'] && this.config['query']['orderBy_sort']) queryString += ' ' + this.config['query']['orderBy_sort'];
            }
            queryString += ' LIMIT ' + this.config['fetched_items'];

            // Play query
            this.connection.query(queryString, function (err, results) {
                if (typeof err !== "undefined") {
                    businessMessages = results;
                    console.info("[mysql] " + businessMessages.length + " business messages - " + new Date());
                } else {
                    console.error("[mysql] error while fetching rows");
                }
                if (callback) {
                    callback(businessMessages);
                }
            });
        }
        else {
            console.warn('[mysql] module not configured');
            callback([]);
        }
    }
});

module.exports = MySqlModule;