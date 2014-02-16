require.config({

    shim: {
        'handlebars': {
            exports: 'Handlebars'
        }
    },

    // Libraries
    paths: {
        'jquery': 'libs/jquery-2.1.0.min',
        'socket-io': 'libs/socket.io.min',
        'handlebars': 'libs/handlebars-v1.3.0',
        'hbs': 'libs/require-handlebars',
        'text': 'libs/text',
        'helpers' : 'libs/helpers',
        'hbsCustomHelpers': 'libs/handlebars-custom-helpers'
    }
});

require(["app"]);