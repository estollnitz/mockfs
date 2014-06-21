/* jshint browser: false, node: true */

module.exports = function (grunt) {
    "use strict";

    var swapHTMLIncludes = function (content) {
        var lines = content.split("\n"),
            devStart = -1, devEnd = -1, deployStart = -1, deployEnd = -1,
            i;

        for (i = 0; i < lines.length; ++i) {
            if (lines[i].indexOf("BEGIN devincludes") >= 0) {
                devStart = i;
            }
            if (lines[i].indexOf("END devincludes") >= 0) {
                devEnd = i;
            }

            if (devStart >= 0 && devEnd >= 0) {
                lines.splice(devStart, devEnd - devStart + 1);
                break;
            }
        }

        for (i = 0; i < lines.length; ++i) {
            if (lines[i].indexOf("BEGIN deployincludes") >= 0) {
                deployStart = i;
            }
            if (lines[i].indexOf("END deployincludes") >= 0) {
                deployEnd = i;
            }

            if (deployStart >= 0 && deployEnd >= 0) {
                lines.splice(deployStart, 1);
                lines.splice(deployEnd - 1, 1);
                break;
            }
        }

        return lines.join("\n");

    };

    grunt.initConfig({
        jshint : {
            options : {
                jshintrc : ".jshintrc"
            },
            all : [
                "*.js",
                "package.json",
                "bower.json",
                ".jshintrc",
                ".jscsrc",
                "js/**/*.js"
            ]
        },
        jscs: {
            src: "<%= jshint.all %>",
            options: {
                config: ".jscsrc"
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: "js",
                    mainConfigFile: "js/main.js",
                    paths: {
                        "jQuery" : "../bower_components/jquery/dist/jquery.min",
                        "bootstrap" : "../bower_components/bootstrap/dist/js/bootstrap.min",
                        "requirejs" : "../bower_components/requirejs/require"
                    },
                    name: "main",
                    out: "build/main.js",
                    optimize: "none",
                    include: ["jQuery", "bootstrap", "requirejs"]
                }
            }
        },
        copy: {
            css : {
                files : [
                    {
                        src: "bower_components/bootstrap/dist/css/bootstrap.min.css",
                        dest: "build/bootstrap.min.css"
                    },
                    {
                        src: "bower_components/codemirror/lib/codemirror.css",
                        dest: "build/codemirror.css"
                    }
                ]
            },
            html : {
                src: "html/index.html",
                dest: "build/index.html",
                options: {
                    process: swapHTMLIncludes
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jscs-checker");
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-copy");

    grunt.registerTask("default", ["jshint", "jscs"]);

    grunt.registerTask("build", ["copy:css", "copy:html", "requirejs"]);

};
