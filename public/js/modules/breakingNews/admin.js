 /**
 * breaking-news admin controller
 */
define([ "jquery","office", "hbs!modules/breakingNews/admin"],
    function ($,Office, template) {

        var breakingNewsAdminModule = Office.AdminModule.extend({

            // SocketIO events
            listen: function(){
                this.socket.emit(this.config["id"] + "Admin" + ":screen");
                this.socket.on(this.config["id"] + ":list", this.getMessageList.bind(this));
            },

            // DOM events
            events: function() {
                this.el.find("input[type='button']").click((function(event) {
                    event.stopPropagation(); 
                    this.newMessage(this.el.find("input[type='text']").val());
                }).bind(this));
            },

            render: function (messages) {
                this.el.html(template({ 'messages' : messages }));
            },

            getMessageList: function(messages) {
                this.render(messages);
            },

            newMessage: function(message) {
                console.log(message);
            }

        });
        return breakingNewsAdminModule;
    }
);