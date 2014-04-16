module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            env: {
                dev: {
                    src: "config/development.json"
                },
                prod: {
                    src: "config/production.json"
                }
            },
            concurrent: {
                dev: {
                    tasks: ["nodemon", "node-inspector"],
                    options: { logConcurrentOutput: true }
                }
            },
            "node-inspector": {
                custom: {
                    options: {
                        'web-port': 8088,
                        'web-host': 'localhost',
                        'debug-port': 5857,
                        'save-live-edit': true
                    }
                }
            },
            nodemon: {
                dev: {
                    options: {
                        args: [grunt.option("proxy") ? "-proxy" : false],
                        file: "src/server.js",
                        nodeArgs: ['--debug=5857']
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
                                replacement: function () {
                                    return '"node_server_url": "' + process.env.server + '"'
                                }
                            }
                        ]
                    }
                }
            },
            "mochaTest": {
                test: {
                    src: ['test/**/*.js']
                }
            }
        }
    );

    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-node-inspector');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('default', [ 'env:dev', 'string-replace', 'nodemon']);
    grunt.registerTask('test', ['mochaTest']);
    grunt.registerTask('test-proxy', ['mochaTest']);
    grunt.registerTask('debug', ['env:dev', 'string-replace', 'concurrent']);
    grunt.registerTask('prod', ['env:prod', 'string-replace', 'nodemon']);
}