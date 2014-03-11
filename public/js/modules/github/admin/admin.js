/**
 * GitHub admin controller
 */
define(["office", "hbs!modules/github/admin/admin"],
    function (Office, template) {

        var GithubAdminModule = Office.AdminModule.extend({

            render: function () {
                this.el.prepend(template({ 'config': this.config }));
            }

        });
        return GithubAdminModule;
    }
);