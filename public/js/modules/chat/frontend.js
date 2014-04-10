/**
 * Chat frontend controller
 */
define([ "office", "hbs!modules/chat/template", "hbs!modules/chat/template-user", "hbs!modules/chat/message-template" ],
    function (Office, template, templateUser, messageTemplate) {

        var chatModule = Office.Module.extend({

            listen: function () {
                this.socket.on(this.config["id"] + ":init", this.initMessages.bind(this));
                this.socket.on(this.config["id"] + ":dispatch", this.updateMesages.bind(this));
                this.socket.on(this.config["id"] + ":users", this.updateUsers.bind(this));

                // get username
                this.username = window.localStorage.getItem(this.config["id"] + ".username");
                if(this.username) {
                    this.render();
                }
                // or ask fot it
                else {
                    this.el.html(templateUser());
                    this.el.find("form").on("submit", this.handleUsernameInput.bind(this));
                }

                // focus on user input
                setTimeout((function() {
                    this.el.find("input[name='username']").focus();
                }).bind(this), 500);
            },

            dispose: function () {
                this.el.find("textarea").off("keypress");
                this.el.find("textarea").off("click");
            },

            sendMessage: function () {
                var text = this.el.find("textarea");
                if (text.val().length > 0) {
                    this.socket.emit(this.config["id"] + ":message", text.val());
                    text.val("");
                }
                return false;
            },

            initMessages: function (messages) {
                var text = this.el.find(".chat-messages");
                text.html("");
                this.updateMesages(messages);
            },

            updateMesages: function (messages) {
                var text = this.el.find(".chat-messages");
                if (!(messages instanceof Array)) {
                    messages = [ messages ];
                }
                messages.forEach(function (message) {
                    text.append(messageTemplate(message));
                });

                this.notify(messages[0]);

                text.scrollTop(text.prop("scrollHeight"));
            },

            updateUsers: function (users) {
                var usersEl = this.el.find(".chat-users");
                usersEl.html("");
                users.forEach(function (user) {
                    usersEl.append('<span class="user module-item">' + user + '</span>');
                });
            },

            handleKeyPress: function (event) {
                if (event.keyCode == 13 || event.currentTarget.type === "button") {
                    this.sendMessage();
                    return false;
                }
            },

            handleUsernameInput: function () {
                // store username
                this.username = this.el.find("input[name='username']").val();
                window.localStorage.setItem(this.config["id"] + ".username", this.username);

                this.render();

                return false;
            },

            render: function() {
                // tell the server about the user
                this.socket.emit(this.config["id"] + ":screen");
                this.socket.emit(this.config["id"] + ":adduser", this.username);

                // display chat
                this.el.find("form").off("submit");
                this.el.html(template());
                this.el.find("textarea").focus();

                // input watch
                this.el.find("textarea").on("keypress", this.handleKeyPress.bind(this));
                this.el.find("input[type=button]").on("click", this.handleKeyPress.bind(this));
            },

            notify: function (message) {
                if (message && (document.webkitHidden || document.hidden)) {
                    var notification;
                    var text = message.author + " : " + message.content;

                    // Let's check if the browser supports notifications
                    if (!("Notification" in window)) {
                        alert("This browser does not support desktop notification");
                    }

                    // Let's check if the user is okay to get some notification
                    else if (Notification.permission === "granted") {
                        // If it's okay let's create a notification
                        notification = new Notification(text);
                    }

                    // Otherwise, we need to ask the user for permission
                    // Note, Chrome does not implement the permission static property
                    // So we have to check for NOT 'denied' instead of 'default'
                    else if (Notification.permission !== 'denied') {
                        Notification.requestPermission(function (permission) {

                            // Whatever the user answers, we make sure we store the information
                            if (!('permission' in Notification)) {
                                Notification.permission = permission;
                            }

                            // If the user is okay, let's create a notification
                            if (permission === "granted") {
                                notification = new Notification(text);
                            }
                        });
                    }

                    if (notification) {
                        setTimeout(function () {
                            notification.close();
                        }, 5000);
                    }
                }
            }
        });

        return chatModule;
    }
);