/**
 * breaking-news admin controller
 */
define([ "jquery", "office", "hbs!modules/breakingNews/admin/admin", "hbs!modules/breakingNews/admin/admin-list"],
    function ($, Office, template, templateList) {

        var breakingNewsAdminModule = Office.AdminModule.extend({

            // SocketIO events
            listen: function () {
                this.socket.emit(this.config["id"] + "admin" + ":screen", this.config.messages);
            },

            // DOM events
            events: function () {
                this.el.find("input[type='button'].new-message").click((function (event) {
                    event.stopPropagation();
                    this.newMessage(this.el.find("input[type='text'].text-message").val());
                }).bind(this));
                this.listEvents();
            },

            newMessage: function (message) {
                this.config.messages.push(message);
                this.refreshList();
            },

            listEvents: function () {
                this.el.find("input[type='button'].remove-message").click((function (event) {
                    event.stopPropagation();
                    this.removeMessage($(event.target).siblings("li").attr("data-index"));
                }).bind(this));
            },

            render: function () {
                // Declare messages list if empty
                if (!this.config.messages) this.config.messages = [];

                this.el.prepend(template({ 'config': this.config }));
                this.el.find("div.messages-list").html(templateList({ 'messages': this.config.messages }));
            },

            refreshList: function () {
                this.el.find("div.messages-list").html(templateList({ 'messages': this.config.messages }));
                this.listEvents();
            },

            removeMessage: function (index) {
                this.config.messages.splice(index, 1);
                this.refreshList();
            }

        });
        return breakingNewsAdminModule;
    }
);