var config, iosockets;

var index = 0;
var pages = [];

exports.withConfig = function(cfg) {
    console.log("[iframe] module loaded");
    config = cfg;
    pages = config["pages"];
    return this;
}

exports.start = function(socketio) {
    var iframeModule = this;
    iosockets = socketio;
    if(pages.length > 0) {
        iosockets.on('connection', function (socket) {
            socket.on("iframe:screen", getNextPage.bind(iframeModule));
        });
        if(pages.length > 1) {
            setInterval(getNextPage.bind(this), config['refresh']);
        }
    }
}

var getNextPage = function() {
    console.log("[iframe] next page : " + pages[index]);
    iosockets.emit("iframe:page", pages[index]);
    index++;
    if(index >= pages.length) {
        index = 0;
    }
};