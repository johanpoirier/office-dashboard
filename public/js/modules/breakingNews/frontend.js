 /**
 * breaking-news frontend controller
 */
define([ "office", "hbs!modules/breakingNews/template"],
    function (Office, template) {

        var breakingNewsModule = Office.Module.extend({

            listen: function () {
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.on(this.config["id"] + ":message", this.displayMessage.bind(this));
            },

            displayMessage: function (message) {
                this.el.html(template({
                    "message": message
                }));
            }
        });

        return breakingNewsModule;
    }
);