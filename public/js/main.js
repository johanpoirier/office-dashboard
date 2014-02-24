require.config({
    shim: {
        'underscore': {
            exports: '_'
        },
        'handlebars': {
            exports: 'Handlebars'
        }
    },

    paths: {
        'jquery': 'libs/vendor/jquery-2.1.0.min',
        'underscore': 'libs/vendor/underscore-min',
        'socket-io': 'libs/vendor/socket.io.min',
        'handlebars': 'libs/vendor/handlebars-v1.3.0',
        'text': 'libs/vendor/text',
        'office': 'libs/office',
        'hbs': 'libs/require-handlebars',
        'hbsCustomHelpers': 'libs/handlebars-custom-helpers',
        'helpers' : 'libs/helpers',
        'storage' : 'libs/storage'
    }
});

// get context
var bootstrapScript = document.querySelector("#bootstrap");
var context = "";
if(bootstrapScript.hasAttribute("data-context")) {
    context = bootstrapScript.getAttribute("data-context") + "-";
}

// start app
require([context + "app"]);
