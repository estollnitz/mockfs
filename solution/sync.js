/* global mockfs, output */

var files = {};

var processDir = function (path, entry) {
    "use strict";

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
