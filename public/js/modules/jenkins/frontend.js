/**
 * Jenkins frontend controller
 */
define([ "office",  "hbs!modules/jenkins/template"],
    function(Office, template) {

        var jenkinsModule = Office.Module.extend({

            listen: function() {
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.on(this.config["id"] + ":jobs", this.displayJobs.bind(this));
            },

            displayJobs: function(jobs) {
                console.info("[" + this.config["id"] + "] " + jobs.length + " jobs in error - " + new Date());
                this.el.html(template({ "jobs": jobs }));
            }
        });

        return jenkinsModule;
    }
);