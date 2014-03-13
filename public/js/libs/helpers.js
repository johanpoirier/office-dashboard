/* JS Helpers collection */
define(function () {

    function appendToHead(url) {
        // check if css already present
        var links = document.getElementsByTagName("link");
        var cssFileDeclared = false;
        for(var i=0; i < links.length; i++) {
            cssFileDeclared = (links[i].getAttribute("href") === url);
            if(cssFileDeclared) {
                break;
            }
        }

        // insert css file in the head section
        if(!cssFileDeclared) {
            var link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = url;
            document.getElementsByTagName("head")[0].appendChild(link);
        }
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
