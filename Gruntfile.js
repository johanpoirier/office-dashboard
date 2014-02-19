module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            env: {
                dev: {
                    src: "config/development.json"
                },
                julien: {
                    src: "config/julien.json"
                },
                prod: {
                    src: "config/production.json"
                }
            },
            nodemon: {
                dev: {
                    options: {
                        file: "src/app.js",
                        nodeArgs: ['--debug']
                    }
                }
            },
            "string-replace": {
                inline: {
                    files: {
                        "public/js/constants.js": "public/js/constants.js"
                    },
                    options: {
                        replacements: [
                            {
                                pattern: /"node_server_url": "(.*)"/,
                                replacement: function() {
                                    return '"node_server_url": "' + process.env.server + '"'
                                }
                            }
                        ]
                    }
                }
            }
        }
    );

    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-string-replace');

    grunt.registerTask('default', ['env:dev', 'string-replace', 'nodemon']);
    grunt.registerTask('julien', ['env:julien', 'string-replace', 'nodemon']);
    grunt.registerTask('prod', ['env:prod', 'string-replace', 'nodemon']);
}
;