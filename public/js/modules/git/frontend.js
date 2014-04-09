/**
 * Git frontend controller
 */
define([ "office", "hbs!modules/git/template", "moment"],
    function (Office, template, moment) {

        var gitModule = Office.Module.extend({

            listen: function () {
                this.repo = this.config["url"].split("/").filter(function(v) { return v !== ""; }).pop();
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.on(this.config["id"] + ":commits", this.displayCommits.bind(this));
            },

            displayCommits: function (commits) {
                this.el.html(template({
                    "repo": this.repo,
                    "branch": this.config["branch"],
                    "update": moment().format(this.updateFormat),
                    "commits": commits
                }));
            }
        });

        return gitModule;
    }
);