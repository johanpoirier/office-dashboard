/**
 * JIRA frontend controller
 */
define([ "office", "hbs!modules/jira/template", "moment"],
    function (Office, template, moment) {

        var jiraModule = Office.Module.extend({

            listen: function () {
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.on(this.config["id"] + ":issues", this.displayIssues.bind(this));
            },

            displayIssues: function (issues) {
                console.info("[" + this.config["id"] + "] " + issues.length + " issues to display - " + new Date());
                this.el.html(template({
                    "update": moment().format(this.updateFormat),
                    "issues": issues
                }));
            }
        });

        return jiraModule;
    }
);