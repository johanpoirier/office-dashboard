 /**
 * breaking-news admin controller
 */
define([ "jquery","office", "hbs!modules/breakingNews/admin"],
    function ($,Office, template) {
        var breakingNewsAdminModule = Office.AdminModule.extend({
            events: function() {
                $(this.el).find("input[type='button']").bind( "click", $.proxy(function(event) {
                    event.stopPropagation(); 
                    this.newMessage($(this.el).find("input[type='text']").val());
                },this));
            },
            render: function () {
                this.el.html(template());
            },
            newMessage: function(message) {
                console.log(message);
            }
        });
        return breakingNewsAdminModule;
    }
);