define([ "jquery", "handlebars", "hbs!modules/jenkins/template"],
    function($, Handlebars, template) {
        return {
            start: function(config, rootEl) {
                console.info("jenkins module init");
                rootEl.append($("<div/>", { "id": "jenkins"}).html(template()));
            }
        }
    }
);