 /**
 * breaking-news frontend controller
 */
define([ "office", "hbs!modules/breakingNews/template"],
    function (Office, template) {
        var breakingNewsModule = Office.Module.extend({

            message: null,

            listen: function () {
                this.socket.on(this.config["id"] + ":message", this.displayMessage.bind(this));
            },

            displayMessage: function (message) {
                if(message) {
                    this.message = message;
                    this.el.html(template({
                        "message": this.message,
                        "animationType": this.config["animationShow"], 
                        "animationDuration": (this.config["refresh"] / 6) / 1000
                    }));
                    setTimeout(this.hideMessage.bind(this), (this.config["refresh"] / 6) * 5);
                }    
            },

            hideMessage: function() {
                this.el.html(template({
                    "message": this.message,
                    "animationType": this.config["animationHide"], 
                    "animationDuration": (this.config["refresh"] / 6) / 1000
                }));
            }
        });

        return breakingNewsModule;
    }
);