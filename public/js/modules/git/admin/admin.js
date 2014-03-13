/**
 * git admin controller
 */
define(["office"],
    function (Office) {
        return Office.AdminModule.extend({

            events: function() {
                var pwdInput = this.el.find("input[name='password']");
                pwdInput.change(function() {
                    if(pwdInput.val() !== "") {
                        pwdInput.val(encodeURIComponent(pwdInput.val()).replace(/[!'()]/g, escape).replace(/\*/g, "%2A"));
                    }
                });
            }

        });
    }
);