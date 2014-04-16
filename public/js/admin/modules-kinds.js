define(["jquery", "hbs!templates/modules-list"],

    function ($, modulesListTemplate) {
        var el = $("#admin .admin-menu-modules");
        var modulesList = [];
        var singletonsList = [];

        return {
            render: function() {
                // get singleton module kinds
                modulesList.filter(function(moduleKind) {
                    return moduleKind["singleton"];
                })
                // verify if it has been already instanciated
                .forEach(function(mod) {
                    mod["instanciated"] = (singletonsList.filter(function(singletonType) {
                        return singletonType === mod["type"]
                    }).length > 0);
                });

                // render filtered list
                el.html(modulesListTemplate({ "modules": modulesList }));

                // set handlers
                el.find("button").off("click");
                if(this.addSingletonHandler) {
                    el.find("button").on("click", this.addSingletonHandler.bind(this));
                }
                this.listenToDragOperation();
            },

            setModulesList: function(list) {
                modulesList = list;
                this.render();
            },

            setSingletonsList: function(list) {
                singletonsList = list;
                this.render();
            },

            setAddSingletonHandler: function(handler) {
                this.addSingletonHandler = handler;
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
                        "type": $(this).find("span").text(),
                        "operation": "add"
                    }));
                });
            }
        }
    }
);