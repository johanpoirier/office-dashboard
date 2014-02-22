 /**
 * breaking-news backend-controller
 */
var OfficeModule = require(__dirname + "/../../../../src/office-module");

var BreakingNewsModule = OfficeModule.extend({

    messages: [],
    index: 0,

    start: function () {
        this.iosockets.on('connection', (function (socket) {
            socket.on(this.config["id"] + "Admin" + ":message", this.getNewMessage.bind(this));
            socket.on(this.config["id"] + "Admin" + ":remove", this.removeMessage.bind(this));
        }).bind(this));

        setInterval(this.displayMessage.bind(this), this.config["refresh"]);
    },

    displayMessage: function () {
        if (typeof this.messages !== "undefined" && this.messages.length > 0) {
            console.log("[" + this.config["id"] + "] display next message : " + this.messages[this.index]);
            this.iosockets.emit(this.config["id"] + ":message", this.messages[this.index]);
            this.index++;
            if (this.index >= this.messages.length) {
                this.index = 0;
            }
        }
        // void
        if(this.messages.length === 0)this.iosockets.emit(this.config["id"] + ":message", null);
    },

    // Receive messages from admin local storage
    getAdminData: function(messages) {
        if(messages != null) {
            console.log("[" + this.config["id"] + "] received stored message from admin : " + messages.length + " messages");
            this.messages = messages;
        }
    },

    // Receive new message from admin
    getNewMessage: function(message) {
        console.log("[" + this.config["id"] + "] received new message from admin : " + message);
        this.messages.push(message);
    },

    removeMessage: function(message) {
        console.log("[" + this.config["id"] + "] remove message : " + message);
        var messageIndex = this.messages.indexOf(message);
        this.messages.splice(messageIndex,1);
    }

});

module.exports = BreakingNewsModule;