var OfficeModule = require(__dirname + "/../../../../src/office-module");

var IframeModule = OfficeModule.extend({

    index: 0,
    pages: [],

    start: function () {
        this.pages = this.config["pages"];
        if (this.pages && this.pages.length > 0) {
            this.registerSocketListener(this.config["id"] + ":screen", this.getNextPage.bind(this));
            this.startTimer();
        }
        else {
            console.warn("[" + this.config["id"] + "] no page to display");
        }
    },

    getData: function() {
        this.pages = this.config["pages"];
        this.startTimer();
    },

    startTimer: function() {
        this.clearTimer();
        if (this.pages.length > 1) {
            this.timer = setInterval(this.getNextPage.bind(this), this.config["refresh"] * 1000);
        }
    },

    getNextPage: function () {
        console.log("[" + this.config["id"] + "] next page : " + this.pages[this.index]);
        this.iosockets.emit(this.config["id"] + ":page", this.pages[this.index]);
        this.index++;
        if (this.index >= this.pages.length) {
            this.index = 0;
        }
    },

    clearTimer: function() {
        if(this.timer) {
            clearInterval(this.timer);
        }
    },

    dispose: function () {
        this.clearTimer();
    }
});

module.exports = IframeModule;