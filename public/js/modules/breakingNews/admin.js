 /**
 * breaking-news admin controller
 */
define([ "jquery","office", "hbs!modules/breakingNews/admin", "hbs!modules/breakingNews/admin-list"],
    function ($,Office, template, templateList) {

        var breakingNewsAdminModule = Office.AdminModule.extend({

            // SocketIO events
            listen: function(){
                this.socket.emit(this.config["id"] + "Admin" + ":screen",this.storage.get("messages"));
            },

            // DOM events
            events: function() {
                this.el.find("input[type='button'].new-message").click((function(event) {
                    event.stopPropagation(); 
                    this.newMessage(this.el.find("input[type='text']").val());
                }).bind(this));
                this.listEvents();
            },

            listEvents: function() {
                this.el.find("input[type='button'].remove-message").click((function(event) {
                    event.stopPropagation(); 
                    this.removeMessage($(event.target).siblings("li").html());
                }).bind(this));
            },

            render: function (messages) {
                this.el.html(template());
                this.el.find("div.messages-list").html(templateList({ 'messages' : this.storage.get("messages") }));
            },

            refreshList: function() {
                this.el.find("div.messages-list").html(templateList({ 'messages' : this.storage.get("messages") }));
                this.listEvents();
            },

            newMessage: function(message) {
                this.storage.add("messages",message);
                this.socket.emit(this.config["id"] + "Admin" + ":message", message);
                this.refreshList();
            },

            removeMessage: function(message) {
                this.storage.remove("messages", message);
                this.socket.emit(this.config["id"] + "Admin" + ":remove", message);
                this.refreshList();
            }

        });
        return breakingNewsAdminModule;
    }
);