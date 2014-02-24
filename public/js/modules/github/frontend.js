/**
 * Github frontend controller
 */
define([ "office", "hbs!modules/github/template", "moment"],
    function (Office, template, moment) {

        var githubModule = Office.Module.extend({

            listen: function () {
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.on(this.config["id"] + ":commits", this.displayCommits.bind(this));
            },

            displayCommits: function (commits) {
                console.info("[" + this.config["id"] + "] " + commits.length + " commits to display - " + new Date());
                commits.forEach(function(data) {
                   var commitDate = moment(data.commit.author.date);
                   data.commit.author.date = commitDate.fromNow();
                });
                this.el.html(template({
                    "repo": this.config["repo"],
                    "update": moment().format(this.updateFormat),
                    "commits": commits
                }));
            }
        });

        return githubModule;
    }
);