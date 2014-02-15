/* JS Helpers collection */
define(['module'], function(module) {
    var helpers = {
        loadModuleCss: function (moduleName) {
            var url = "/js/modules/" + moduleName + "/" + moduleName + ".css";
            var link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = url;
            document.getElementsByTagName("head")[0].appendChild(link);
        }
    };
    return helpers;
});
