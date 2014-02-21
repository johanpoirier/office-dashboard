 /**
 * breaking-news backend-controller
 */
var OfficeModule = require(__dirname + "/../../../../src/office-module");

var BreakingNewsModule = OfficeModule.extend({

    messages: [],
    index: 0,

    start: function () {
        this.messages = this.config["messages"];
        if (this.messages.length > 1) {
            setInterval(this.getData.bind(this), this.config["refresh"]);
        }
    },

    getData: function () {
        console.log("[" + this.config["id"] + "] next message : " + this.messages[this.index].text);
        this.iosockets.emit(this.config["id"] + ":message", this.messages[this.index]);
        this.index++;
        if (this.index >= this.messages.length) {
            this.index = 0;
        }
    }
});

module.exports = BreakingNewsModule;