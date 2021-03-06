module.exports = function(grunt) {

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jscs");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-mocha-istanbul");
    grunt.loadNpmTasks("grunt-execute");
    grunt.loadNpmTasks("grunt-nodemon");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-watch");

    var testOutputLocation = process.env.CIRCLE_TEST_REPORTS || "test_output";
    var artifactsLocation = "build_artifacts";
    grunt.initConfig({
        copy: {
            main: {
                files: [{
                    expand: true,
                    src: ["node_modules/bootstrap/dist/css/bootstrap.min.css"],
                    dest: "public/bootstrap.min.css"}]
            }
        },
        less: {
            dev: {
                files: {
                    "public/main.css": "less/main.less"
                }
            }
        },
        execute: {
            serve: {
                src: ["server.js"]
            }
        },
        watch: {
            lessWatch: {
                files: ["less/main.less"],
                tasks: ["less:dev"]
            }
        },
        nodemon: {
            serverStart: {
                script: "server.js",
                options: {
                    watch: ["server"]
                }
            }
        },
        jshint: {
            all: ["Gruntfile.js", "server.js", "server/**/*.js", "test/**/*.js", "public/*.js"],
            options: {
                jshintrc: true
            }
        },
        jscs: {
            all: ["Gruntfile.js", "server.js", "server/**/*.js", "test/**/*.js", "public/*.js"]
        },
        mochaTest: {
            test: {
                src: ["test/**/*.js"]
            },
            ci: {
                src: ["test/**/*.js"],
                options: {
                    reporter: "xunit",
                    captureFile: testOutputLocation + "/mocha/results.xml",
                    quiet: true
                }
            }
        },
        "mocha_istanbul": {
            test: {
                src: ["test/**/*.js"]
            },
            ci: {
                src: ["test/**/*.js"],
                options: {
                    quiet: true
                }
            },
            options: {
                coverageFolder: artifactsLocation,
                reportFormats: ["none"],
                print: "none"
            }
        },
        "istanbul_report": {
            test: {

            },
            options: {
                coverageFolder: artifactsLocation
            }
        },
        "istanbul_check_coverage": {
            test: {

            },
            options: {
                coverageFolder: artifactsLocation,
                check: {
                    lines: 80,
                    statements: 80,
                    branches: 80,
                    functions: 80
                }
            }
        }
    });

    grunt.registerMultiTask("istanbul_report", "Solo task for generating a report over multiple files.", function () {
        var done = this.async();
        var cmd = process.execPath;
        var istanbulPath = require.resolve("istanbul/lib/cli");
        var options = this.options({
            coverageFolder: "coverage"
        });
        grunt.util.spawn({
            cmd: cmd,
            args: [istanbulPath, "report", "--dir=" + options.coverageFolder]
        }, function(err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    grunt.registerTask("check", ["jshint", "jscs"]);
    grunt.registerTask("test", ["check", "mochaTest:test", "mocha_istanbul:test", "istanbul_report",
        "istanbul_check_coverage"]);
    grunt.registerTask("ci-test", ["check", "mochaTest:ci", "mocha_istanbul:ci", "istanbul_report",
        "istanbul_check_coverage"]);
    grunt.registerTask("serve", ["execute:serve", "watch"]);
    //grunt.registerTask("nodemon", "nodemon:server");
    grunt.registerTask("default", "test");
};
