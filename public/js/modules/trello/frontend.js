/**
 * Trello frontend controller
 */
define([ "office", "hbs!modules/trello/template"],
    function(Office, template) {

        var trelloModule = Office.Module.extend({

            listen: function () {
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.on(this.config["id"] + ":activities", this.displayActivities.bind(this));
            },

            displayActivities: function(activities) {
                console.info("[" + this.config["id"] + "]" + activities.length + " activities to display - " + new Date());
                this.el.html(template({
                    "board": this.config["board"],
                    "activities": activities
                }));
            }
        });

        return trelloModule;
    }
);