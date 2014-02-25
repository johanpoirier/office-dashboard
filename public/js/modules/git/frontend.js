/**
 * Git frontend controller
 */
define([ "office", "hbs!modules/git/template", "moment"],
    function (Office, template, moment) {

        var gitModule = Office.Module.extend({

            listen: function () {
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.on(this.config["id"] + ":commits", this.displayCommits.bind(this));
            },

            displayCommits: function (commits) {
                this.el.html(template({
                    "repo": this.config["repo"],
                    "branch": this.config["branch"],
                    "update": moment().format(this.updateFormat),
                    "commits": commits
                }));
            }
        });

        return gitModule;
    }
);