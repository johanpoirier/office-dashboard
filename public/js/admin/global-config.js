define(["jquery"],

    function ($) {
        var el = $(".admin-menu #admin-menu-grid-dimensions");
        var inputGridColumns = el.find("input[name='columns']");
        var inputGridRows = el.find("input[name='rows']");
        var config = {};

        // listen to grid cols & rows change
        var gridSizeChangeHanlder = function(callback) {
            return function() {
                config["grid"] = {
                    "columns": inputGridColumns.val(),
                    "rows": inputGridRows.val()
                };
                callback();
            }
        }

        return {
            get: function(key) {
                return config[key];
            },

            set: function(key, value) {
                config[key] = value;
            },

            getConfig: function() {
                return config;
            },

            setConfig: function(globalConfig) {
                config = globalConfig;
                inputGridColumns.val(config["grid"]["columns"]);
                inputGridRows.val(config["grid"]["rows"]);
            },

            listenToGridSizeChange: function(callback) {
                inputGridColumns.change(gridSizeChangeHanlder(callback));
                inputGridRows.change(gridSizeChangeHanlder(callback));
            }
        }
    }
);