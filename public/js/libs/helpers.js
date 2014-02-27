/* JS Helpers collection */
define(function() {

    function appendToHead(url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    }

    var helpers = {
        loadModuleCss: function (moduleName) {
            appendToHead("/js/modules/" + moduleName + "/" + moduleName + ".css");
        },
        loadAdminModuleCss: function (moduleName) {
            appendToHead("/js/modules/" + moduleName + "/" + moduleName + "-admin" +  ".css");
        }
    };
    return helpers;
});
