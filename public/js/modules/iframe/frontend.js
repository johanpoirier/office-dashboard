 /**
 * iFrame frontend controller
 */
define([ "office", "hbs!modules/iframe/template"],
    function (Office, template) {

        var iframeModule = Office.Module.extend({

            listen: function () {
                this.setFullscreenMode();
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.on(this.config["id"] + ":page", this.displayPage.bind(this));
            },

            displayPage: function (page) {
                console.info("[" + this.config["id"] + "] page to display : " + page);
                this.el.html(template({
                    "url": page
                }));
                this.setFullscreenMode();
            },

            setFullscreenMode: function() {
                if(this.config["fullscreen"]) {
                    this.el.addClass("fullscreen");
                }
                else {
                    this.el.removeClass("fullscreen");
                }
            }
        });

        return iframeModule;
    }
);