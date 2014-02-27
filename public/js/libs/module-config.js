define(["jquery",
    "underscore",
    "hbs!templates/module-conf"],

    function ($, _, moduleConfTemplate) {

        var ModuleConfig = function (rootEl, configPattern, socket) {
            this.rootEl = rootEl;
            this.configPattern = configPattern;
            this.socket = socket;
        }

        _.extend(ModuleConfig.prototype, {
            displayModuleConfForm: function (doneCallback) {
                this.doneCallback = doneCallback;
                var fields = [];
                for (var key in this.configPattern) {
                    if (key !== "type") {
                        fields.push({
                            "name": key,
                            "value": this.configPattern[key]
                        })
                    }
                }

                this.rootEl.append(moduleConfTemplate({
                    "title": "Fill new " + this.configPattern.type + " module configuration :",
                    "fields": fields
                }));

                this.el = this.rootEl.find(".modal");
                this.el.find("form").submit(this.createModule.bind(this));
                this.el.find("button.button-cancel").click(this.remove.bind(this));
            },

            createModule: function () {
                var inputs = this.el.find("form input");
                var newConf = { "type": this.configPattern.type };
                for (var i = 0; i < inputs.length; i++) {
                    var input = $(inputs[i]);
                    newConf[input.attr("name")] = input.val();
                }

                this.socket.emit('add-module-instance', newConf);

                this.remove();

                return false;
            },

            remove: function() {
                this.el.find("button.button-cancel").unbind();
                this.el.find("form").unbind();
                this.el.remove();

                if(this.doneCallback) {
                    this.doneCallback();
                }
            }
        });

        return ModuleConfig;
    }
);