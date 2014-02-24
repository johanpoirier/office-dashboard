/**
 * Git frontend controller
 */
define([ "office", "hbs!modules/git/template"],
    function (Office, template) {

        var gitModule = Office.Module.extend({

            listen: function () {
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.on(this.config["id"] + ":commits", this.displayCommits.bind(this));
            },

            displayCommits: function (commits) {
                console.info("[" + this.config["id"] + "] commits : ", commits);
                this.el.html(template({
                    "repo": this.config["repo"],
                    "branch": this.config["branch"],
                    "commits": commits
                }));
            }
        });

        return gitModule;
    }
);