/* jshint browser: false, node: true */

module.exports = function (grunt) {
    "use strict";

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
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jscs-checker");

    grunt.registerTask("default", ["jshint", "jscs"]);

};
