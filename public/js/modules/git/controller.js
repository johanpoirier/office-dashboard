define([ "jquery", "handlebars", "hbs!modules/git/template"],
    function($, Handlebars, template) {
        return {
            start: function(config, rootEl) {
                console.info("git module init");
                rootEl.append($("<div/>", { "id": config["id"]}).html(template()));
            }
        }
    }
);