/**
 * Jenkins frontend controller
 */
define([
    "office",
    "moment",
    "hbs!modules/jenkins/templateError",
    "hbs!modules/jenkins/templateNoError",
    "hbs!modules/jenkins/templateQueue",
    "hbs!modules/jenkins/templateQueueEmpty"],

    function(Office, moment, templateError, templateNoError, templateQueue, templateQueueEmpty) {

        var jenkinsModule = Office.Module.extend({

            listen: function() {
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.on(this.config["id"] + ":jobs", this.displayJobs.bind(this));
                this.socket.on(this.config["id"] + ":items", this.displayQueue.bind(this));
            },

            displayJobs: function(jobs) {
                if(jobs.length > 0) {
                    console.debug("[" + this.config["id"] + "] " + jobs.length + " job(s) in error");
                    this.el.html(templateError({
                        "jobs": jobs,
                        "update": moment().format(this.updateFormat),
                        "title": this.config["label"]
                    }));
                }
                else {
                    this.el.html(templateNoError({
                        "update": moment().format(this.updateFormat),
                        "title": this.config["label"]
                    }));
                }
            },

            displayQueue: function(items) {
                //items = [{ "why": "because", "task": { "name": "OKAPI", "url": "plouf" } }];
                if(items.length > 0) {
                    console.debug("[" + this.config["id"] + "] " + items.length + " job(s) in queue");
                    this.el.html(templateQueue({
                        "items": items,
                        "update": moment().format(this.updateFormat),
                        "title": this.config["label"]
                    }));
                }
                else {
                    this.el.html(templateQueueEmpty({
                        "update": moment().format(this.updateFormat),
                        "title": this.config["label"]
                    }));
                }
            }
        });

        return jenkinsModule;
    }
);