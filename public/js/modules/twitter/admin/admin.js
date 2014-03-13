/**
 * Twitter admin controller
 */
define(["office", "hbs!modules/twitter/admin/admin-list"],
    function (Office, templateList) {
        return Office.AdminModule.extend({

            events: function() {
                if(!this.config["topics"]) {
                    this.config["topics"] = [];
                }
                this.displayTopics();

                this.el.find("button.new-topic").click((function () {
                    var topicInput = this.el.find("input[name='topic']");
                    this.config["topics"].push(topicInput.val());
                    this.displayTopics();
                    topicInput.val("");
                    return false;
                }).bind(this));
            },

            displayTopics: function() {
                this.el.find(".topic-list").html(templateList({ 'topics': this.config["topics"] }));
                this.el.find(".topic-list button.remove-topic").unbind();
                this.el.find(".topic-list button.remove-topic").click((function(e) {
                    var topicIndex = $(e.target).parent().data("index");
                    if(!isNaN(topicIndex)) {
                        this.config["topics"].splice(topicIndex, 1);
                        this.displayTopics();
                    }
                    return false;
                }).bind(this));
            }

        });
    }
);