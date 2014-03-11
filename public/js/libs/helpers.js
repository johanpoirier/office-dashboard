/* JS Helpers collection */
define(function () {

    function appendToHead(url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    }

    return {
        loadModuleCss: function (moduleName) {
            appendToHead("/js/modules/" + moduleName + "/" + moduleName + ".css");
        },

        loadAdminModuleCss: function (moduleName) {
            appendToHead("/js/modules/" + moduleName + "/admin/admin.css");
        },

        generateGridTemplateProperty: function (nb) {
            var cssLine = [];
            for (var i = 0; i < nb; i++) {
                cssLine.push("1fr");
            }
            return cssLine.join(" ");
        }
    }
});
