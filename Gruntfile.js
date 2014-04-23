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

            "nodemon": {
                dev: {
                    options: {
                        args: [grunt.option("proxy") ? "-proxy" : false],
                        file: "src/server.js",
                        nodeArgs: ['--debug=5857']
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

            "uncss": {
                dist: {
                    src: ['public/admin.html'],
                    dest: 'build/css/admin-build.css'
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

    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-node-inspector');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-uncss');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('build', [ 'env:prod', 'clean', 'cssmin', 'copy', 'processhtml', 'string-replace:prod', 'requirejs:front', 'requirejs:admin' ]);

    grunt.registerTask('test', ['mochaTest']);
    grunt.registerTask('test-proxy', ['mochaTest']);

    grunt.registerTask('default', [ 'env:local', 'string-replace:dev', 'nodemon']);
    grunt.registerTask('debug', ['env:local', 'string-replace', 'concurrent']);
    grunt.registerTask('dev', [ 'env:dev', 'clean', 'cssmin', 'copy', 'processhtml', 'string-replace:dev', 'requirejs:front', 'requirejs:admin', 'nodemon' ]);
    grunt.registerTask('prod', [ 'env:prod', 'clean', 'cssmin', 'copy', 'processhtml', 'string-replace:prod', 'requirejs:front', 'requirejs:admin', 'nodemon' ]);
}