module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});
    require('time-grunt')(grunt);

    // Project configuration.
    grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),

            env: {
                local: {
                    src: "config/local.json"
                },
                demo: {
                    src: "config/demo.json"
                },
                dev: {
                    src: "config/development.json"
                },
                prod: {
                    src: "config/production.json"
                },
                openshift: {
                    src: "config/openshift.json"
                }
            },

            concurrent: {
                dev: {
                    tasks: ["nodemon:debug", "node-inspector"],
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

            "nodemon": {
                debug: {
                    options: {
                        args: [grunt.option("proxy") ? "-proxy" : false],
                        file: "src/server.js",
                        nodeArgs: ['--debug=5857']
                    }
                },
                run: {
                    options: {
                        args: [grunt.option("proxy") ? "-proxy" : false],
                        file: "src/server.js"
                    }
                }
            },

            "string-replace": {
                dev: {
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
                },
                prod: {
                    files: {
                        "build/js/constants.js": "build/js/constants.js"
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

            "clean": ['build'],

            "copy": {
                "build": {
                    files: [
                        {
                            expand: true,
                            cwd: 'public/',
                            src: [
                                'images/**',
                                'js/libs/vendor/require.js',
                                'js/modules/**',
                                'js/events.js',
                                'js/constants.js',
                                'fonts/**',
                                '*.ico'
                            ],
                            dest: 'build/'
                        }
                    ]
                }
            },

            "requirejs": {
                front: {
                    options: {
                        baseUrl: "public/js",
                        mainConfigFile: "public/js/config.js",
                        name:'main-front',
                        out: "build/js/main-front.js",
                        findNestedDependencies: true,
                        inlineText: true,
                        optimize: "uglify2",
                        include: ["office", "moment", "hbsCustomHelpers"]
                    }
                },
                admin: {
                    options: {
                        baseUrl: "public/js",
                        mainConfigFile: "public/js/config.js",
                        name:'main-admin',
                        out: "build/js/main-admin.js",
                        findNestedDependencies: true,
                        inlineText: true,
                        optimize: "uglify2"
                    }
                }
            },

            "cssmin": {
                combine: {
                    options: {
                        keepSpecialComments: 0,
                        report: 'min'
                    },
                    files: {
                        'build/css/admin-build.css': [
                            'public/css/normalize.css',
                            'public/css/animate.css',
                            'public/css/font-awesome.css',
                            'public/css/app.css',
                            'public/css/front.css',
                            'public/css/admin.css'
                        ],
                        'build/css/front-build.css': [
                            'public/css/normalize.css',
                            'public/css/animate.css',
                            'public/css/jquery.gridster.css',
                            'public/css/font-awesome.css',
                            'public/css/app.css',
                            'public/css/front.css'
                        ]
                    }
                }
            },

            "processhtml": {
                dist: {
                    files: {
                        'build/admin.html': ['public/admin.html'],
                        'build/index.html': ['public/index.html']
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

    grunt.registerTask('build', [ 'env:prod', 'clean', 'cssmin', 'copy', 'processhtml', 'string-replace:prod', 'requirejs:front', 'requirejs:admin' ]);
    grunt.registerTask('test', ['mochaTest']);

    grunt.registerTask('debug', ['env:local', 'string-replace:dev', 'concurrent']);
    grunt.registerTask('default', [ 'env:local', 'string-replace:dev', 'nodemon:run']);
    grunt.registerTask('demo', [ 'env:demo', 'string-replace:dev', 'nodemon:run' ]);
    grunt.registerTask('dev', [ 'env:dev', 'clean', 'cssmin', 'copy', 'processhtml', 'string-replace:dev', 'requirejs:front', 'requirejs:admin', 'nodemon:run' ]);
    grunt.registerTask('openshift', [ 'env:openshift', 'clean', 'cssmin', 'copy', 'processhtml', 'string-replace:prod', 'requirejs:front', 'requirejs:admin', 'nodemon:run' ]);
    grunt.registerTask('prod', [ 'env:prod', 'clean', 'cssmin', 'copy', 'processhtml', 'string-replace:prod', 'requirejs:front', 'requirejs:admin', 'nodemon:run' ]);
}