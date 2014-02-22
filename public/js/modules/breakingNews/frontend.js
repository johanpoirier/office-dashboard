 /**
 * breaking-news frontend controller
 */
define([ "office", "hbs!modules/breakingNews/template"],
    function (Office, template) {

        var breakingNewsModule = Office.Module.extend({

            listen: function () {
                this.socket.on(this.config["id"] + ":message", this.displayMessage.bind(this));
            },

            displayMessage: function (message) {
                var display = (message === null) ? "hide" : "show";
                this.el.html(template({
                    "message": message,
                    "display": display
                }));
            }
        });

        return breakingNewsModule;
    }
);