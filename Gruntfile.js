// Copyright, 2013-2014, by Tomas Korcak. <korczis@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

module.exports = function (grunt) {
    'use strict';

    var path = require('path'),
        utils = require("./modules/utils");

    var config = utils.loadConfig(path.join(__dirname, "./config.js")),
        templatesDir = "./public/app/";

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ember-templates');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-neuter');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        meta: {
            banner: '/*! <%=pkg.name%> - v<%=pkg.version%> (build <%=pkg.build%>) - ' +
                '<%=grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT")%> */'
        },

        clean: [
            './public/assets/*.js'
        ],

        emberTemplates: {
            compile: {
                options: {
                    templateName: function (filename) {
                        var res = filename;

                        res = res.replace(templatesDir, '');
                        res = res.replace(/^routes\//, "");

                        return res;
                    }
                },
                files: {
                    "./public/assets/templates.js": [
                        templatesDir + "**/*.hbs"
                    ]
                }
            }
        },

        express: {
            custom: {
                tasks: ['build'],
                options: {
                    showStack: true,
                    port: config.server.port,
                    bases: [
                        path.join(__dirname, "public"),
                        path.join(__dirname, "modules")
                    ],
                    server: path.join(__dirname, "modules/server/reloader.js"),
                    livereload: true,
                    serverreload: false
                }
            }
        },

        // FIXME: Grunt task requirejs is not working!
        requirejs: {
            compile: {
                options: {
                    baseUrl: "public/",
                    mainConfigFile: "js/main.js",
                    out: "assets/bundle.js",
                    name: "js/main.js"
                }
            }
        },

        jsdoc: {
            client: {
                src: [
                    "./public/app/**/*.js"
                ],
                dest: "./public/doc/client/"
            },
            server: {
                src: [
                    "./app.js",
                    "./modules/**/*.js"
                ],
                dest: "./public/doc/server/"
            }
        },

        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true,
                    next: true,
                    require: true
                }
            },
            client: [
                "public/client/**/*.js"
            ],
            grunt: [
                "Gruntfile.js"
            ],
            server: [
                "app.js",
                "modules/**/*.js"
            ],
            tests: [
                "tests/**/*.js"
            ]
        },

        less: {
            dist: {
                files: {
                    'public/assets/main.css': 'public/css/*.less'

                    // Please, keep your style below this line for easier merge with forked projects
                }
            }
        },

        watch: {
            less: {
                tasks: ['less'],
                files: [
                    path.join(__dirname, "public/css/**/*.less")
                ]
            },

            templates: {
                tasks: ['emberTemplates'],
                files: [
                    path.join(__dirname, "public/**/*.hbs")
                ]
            }
        }
    });

    // Build all assets required for running the app
    grunt.registerTask('build', [
       'less',
        'emberTemplates'
    ]);

    // Generate documentation
    grunt.registerTask('doc', [
        'jsdoc'
    ]);

    grunt.registerTask('server', [
        'clean',
        'build',
        'express',
        // 'express-keepalive',
        'watch'
    ]);

    // Default tasks.
    grunt.registerTask('default', [
        'clean',
        'build'
    ]);
};
