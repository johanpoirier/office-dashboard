/**
 * Git frontend controller
 */
define([ "office", "hbs!modules/github/template"],
    function (Office, template) {

        var gitModule = Office.Module.extend({

            listen: function () {
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.on(this.config["id"] + ":commits", this.displayCommits.bind(this));
            },

            displayCommits: function (commits) {
                console.info("[" + this.config["id"] + "] " + commits.length + " commits to display - " + new Date());
                this.el.html(template({
                    "repo": this.config["repo"],
                    "commits": commits
                }));
            }
        });

        return gitModule;
    }
);