/**
 * breaking-news admin controller
 */
define([ "jquery", "office", "hbs!modules/breakingNews/admin/admin-list", "hbsCustomHelpers"],
    function ($, Office, templateList) {

        var breakingNewsAdminModule = Office.AdminModule.extend({

            context: {
                animations: ["bounce", "flash", "pulse", "rubberBand", "shake", "swing", "tada", "wobble", "bounceIn", "bounceInDown", "bounceInLeft", "bounceInRight", "bounceInUp", "bounceOut", "bounceOutDown", "bounceOutLeft", "bounceOutRight", "bounceOutUp", "fadeIn", "fadeInDown", "fadeInDownBig", "fadeInLeft", "fadeInLeftBig", "fadeInRight", "fadeInRightBig", "fadeInUp", "fadeInUpBig", "fadeOut", "fadeOutDown", "fadeOutDownBig", "fadeOutLeft", "fadeOutLeftBig", "fadeOutRight", "fadeOutRightBig", "fadeOutUp", "fadeOutUpBig", "flip", "flipInX", "flipInY", "flipOutX", "flipOutY", "lightSpeedIn", "lightSpeedOut", "rotateIn", "rotateInDownLeft", "rotateInDownRight", "rotateInUpLeft", "rotateInUpRight", "rotateOut", "rotateOutDownLeft", "rotateOutDownRight", "rotateOutUpLeft", "rotateOutUpRight", "slideInDown", "slideInLeft", "slideInRight", "slideOutLeft", "slideOutRight", "slideOutUp", "hinge", "rollIn", "rollOut"],
            },

            // SocketIO events
            listen: function () {
                this.socket.emit(this.config["id"] + ":admin-screen", this.config.messages);
            },

            // DOM events
            events: function () {
                this.el.find("button.new-message").click((function (event) {
                    event.stopPropagation();
                    this.newMessage(this.el.find("input[type='text'].text-message").val());
                }).bind(this));
                this.listEvents();
            },

            newMessage: function (message) {
                this.config.messages.push(message);
                //this.socket.emit(this.config["id"] + ":admin-message", message);
                this.refreshList();
            },

            listEvents: function () {
                this.el.find("button.remove-message").click((function (event) {
                    event.stopPropagation();
                    this.removeMessage($(event.target).siblings("li").attr("data-index"));
                }).bind(this));
            },

            render: function () {
                // Declare messages list if empty
                if (!this.config.messages) this.config.messages = [];

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