/**
 * git admin controller
 */
define(["office", "hbs!modules/git/admin/admin"],
    function (Office, template) {

        var GitAdminModule = Office.AdminModule.extend({

            render: function () {
                this.el.prepend(template({ 'config': this.config }));
            }

        });
        return GitAdminModule;
    }
);