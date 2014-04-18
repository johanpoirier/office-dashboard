/**
 * JIRA frontend controller
 */
define([ "office", "hbs!modules/jira/template", "moment"],
    function (Office, template, moment) {

        var jiraModule = Office.Module.extend({

            listen: function () {
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.on(this.config["id"] + ":issues", this.displayIssues.bind(this));
                this.lastIssueKey = null;
            },

            displayIssues: function (issues) {
                console.info("[" + this.config["id"] + "] " + issues.length + " issues to display - " + new Date());

                // alert on new issue
                if(!this.lastIssueKey) {
                    this.lastIssueKey = issues[0]["key"];
                }
                else if(this.lastIssueKey !== issues[0]["key"]) {
                    this.lastIssueKey = issues[0]["key"];
                    this.alert(20);
                }
                else {
                    return;
                }

                // render
                this.el.html(template({
                    "update": moment().format(this.updateFormat),
                    "issues": issues,
                    "title": this.config["label"].length > 0 ? this.config["label"] : "JIRA"
                }));
            }
        });

        return jiraModule;
    }
);