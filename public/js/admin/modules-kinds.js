define(["jquery", "hbs!templates/modules-list"],

    function ($, modulesListTemplate) {
        var el = $("#admin .admin-modules");
        var modulesList = [];

        return {
            setModulesList: function(list) {
                modulesList = list;
                el.html(modulesListTemplate({ "modules": modulesList }));
            },

            getByType: function(type) {
                var results = modulesList.filter(function (mod) {
                    return mod.type === type;
                });
                return (results.length > 0) ? results[0] : false;
            },

            listenToDragOperation: function() {
                // enable copy drag on module kinds list
                var modulesKindsEl = el.find("li");
                modulesKindsEl.unbind("dragstart");
                modulesKindsEl.bind("dragstart", function (e) {
                    e.originalEvent.dataTransfer.effectAllowed = 'move'; // only dropEffect='move' will be dropable
                    e.originalEvent.dataTransfer.setData('text/plain', JSON.stringify({
                        "type": $(this).text(),
                        "operation": "add"
                    }));
                });
            }
        }
    }
);