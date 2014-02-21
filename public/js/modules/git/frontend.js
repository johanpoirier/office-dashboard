/**
 * Git frontend controller
 */
define([ "office", "hbs!modules/github/template"],
    function (Office, template) {

        var gitModule = Office.Module.extend({

            listen: function () {
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.on(this.config["id"] + ":data", this.displayCommits.bind(this));
            },

            displayCommits: function (data) {
                console.info("[" + this.config["id"] + "] data : ", data);
                /*this.el.html(template({
                    "repo": this.config["repo"],
                    "commits": commits
                }));*/
            }
        });

        return gitModule;
    }
);