/* global mockfs, output */

define(function (require, exports) {
    "use strict";

    exports.syncRecursive = function () {
        var files = {};

        var processDir = function (path, entry) {

            var files = mockfs.listSync(path);
            files.forEach(function (f) {
                try {
                    var childPath = mockfs.join(path, f),
                        stat = mockfs.statSync(childPath);
              
                    if (stat.isDirectory()) {
                        entry[f] = {};
                        processDir(childPath, entry[f]);
                    } else if (stat.isFile()) {
                        entry[f] = "file";
                    } else {
                        entry[f] = "unknown";
                    }
              
                } catch (e) {
                    entry[f] = "error: " + e.message;
                }
            });
        };

        processDir("/", files);

        output(files);
    };

    exports.listRoot = function () {
        mockfs.list("/", function (err, result) {
            if (err) {
                output("error: " + err);
            } else {
                output(result);
            }
        });
    };

    exports.statRoot = function () {
        mockfs.stat("/", function (err, result) {
            if (err) {
                output("error: " + err);
            } else {
                output("stat result: isFile: " + result.isFile() + ", isDirectory: " + result.isDirectory());
            }
        });
    };

    exports.statTimeout = function () {
        var TIMEOUT = 500;
        var timer = setTimeout(function () {
            timer = null;
            output("error: timeout");
        }, TIMEOUT);

        mockfs.stat("/f/ff", function (err, result) {
            if (timer) {
                clearTimeout(timer);
                if (err) {
                    output("error: " + err);
                } else {
                    output("stat result: isFile: " + result.isFile() + ", isDirectory: " + result.isDirectory());
                }
            }
        });
    };
});
