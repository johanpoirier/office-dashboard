define([ "office", "jquery", "socket-io", "handlebars", "hbs!modules/github/template"],
    function (Office, $, socketio, Handlebars, template) {

        var githubModule = Office.Module.extend({

            listen: function () {
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.on(this.config["id"] + ":commits", this.displayCommits.bind(this));
            },

            displayCommits: function (commits) {
                if (this.el === undefined) {
                    this.rootEl.append($("<div/>", { "id": this.config["id"], "class": "module" }));
                    this.el = this.rootEl.find("div#" + this.config["id"]);
                }
                console.info("[" + this.config["type"] + "] " + commits.length + " commits to display - " + new Date());
                this.el.html(template({
                    "repo": this.config["repo"],
                    "commits": commits
                }));
            }
        });

        return githubModule;
    }
);