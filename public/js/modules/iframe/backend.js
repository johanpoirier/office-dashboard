var OfficeModule = require(__dirname + "/../../../../src/office-module");

var IframeModule = OfficeModule.extend({

    index: 0,
    pages: [],

    start: function () {
        this.pages = this.config["pages"];
        if (this.pages.length > 0) {
            this.iosockets.on('connection', (function (socket) {
                socket.on(this.config["id"] + ":screen", this.getNextPage.bind(this));
            }).bind(this));
            if (this.pages.length > 1) {
                setInterval(this.getNextPage.bind(this), this.config["refresh"]);
            }
        }
    },

    getNextPage: function () {
        console.log("[" + this.config["id"] + "] next page : " + this.pages[this.index]);
        this.iosockets.emit(this.config["id"] + ":page", this.pages[this.index]);
        this.index++;
        if (this.index >= this.pages.length) {
            this.index = 0;
        }
    }
});

module.exports = IframeModule;