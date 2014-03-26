/**
 * iFrame admin controller
 */
define(["office", "hbs!modules/iframe/admin/admin-list"],
    function (Office, templateList) {
        return Office.AdminModule.extend({

            events: function() {
                if(!this.config["pages"]) {
                    this.config["pages"] = [];
                }
                this.displayPages();

                this.el.find("button.new-page").click((function () {
                    var pageInput = this.el.find("input[name='page']");
                    this.config["pages"].push(pageInput.val());
                    this.displayPages();
                    pageInput.val("");
                    return false;
                }).bind(this));

                var fullscreenInput = this.el.find("input[name='fullscreen']");
                fullscreenInput.click((function () {
                    this.config["fullscreen"] = fullscreenInput.is(':checked');
                }).bind(this));
                fullscreenInput.prop("checked", this.config["fullscreen"]);
            },

            displayPages: function() {
                this.el.find(".page-list").html(templateList({ 'pages': this.config["pages"] }));
                this.el.find(".page-list button.remove-page").unbind();
                this.el.find(".page-list button.remove-page").click((function(e) {
                    var pageIndex = $(e.target).parent().data("index");
                    if(!isNaN(pageIndex)) {
                        this.config["pages"].splice(pageIndex, 1);
                        this.displayPages();
                    }
                    return false;
                }).bind(this));
            }

        });
    }
);