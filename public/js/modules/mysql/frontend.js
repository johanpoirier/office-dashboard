/**
 * MySQL frontend controller
 */
define([ "office", "hbs!modules/mysql/template", "hbsCustomHelpers"],
    function (Office, template, helpers) {

        var mysqlModule = Office.Module.extend({

            listen: function() {
                this.socket.emit("mysql:screen");
                this.socket.on("mysql:businessMessage", this.displayMessages.bind(this));
            },

            displayMessages: function (messages) {
                // Gather fields names
                var fields = [];
                this.config['fields'].forEach(function (field) {
                    fields.push(field.field_displayed_name);
                });

                // Format messages
                var formattedMessages = [];
                messages.forEach(function (message) {
                    var formattedMessage = {};
                    this.config['fields'].forEach(function (field) {
                        formattedMessage[field.field_displayed_name] = message[field.field_table_name];
                    });
                    formattedMessages.push(formattedMessage);
                },this);

                this.el.html(template({ "title": this.config["title"], "messages": formattedMessages, "fields": fields }));
            }
        });

        return mysqlModule;
    }
);