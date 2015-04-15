/* global module */

(function (mod) {
    "use strict";
    if (typeof exports === "object" && typeof module === "object") { // CommonJS
        module.exports = mod();
    } else if (typeof define === "function" && define.amd) { // AMD
        return define([], mod);
    } else { // Plain browser env
        window.mockfs = mod();
    }
})(function () {
    "use strict";

    var MIN_DELAY = 10,
        DELAY_VARIANCE = 100;

    var ERROR_NO_SUCH_ENTRY = "No such entry",
        ERROR_FS_ERROR = "Filesystem error",
        ERROR_TIMEOUT = "Filesystem timeout";

    var FILESYSTEM = {
        a : "file",
        b : {
            aa : "file",
            bb : "error",
            cc : "file",
            dd : "timeout"
        },
        c : "file",
        d : {
            dd : { }
        },
        e : "file",
        f : {
            ee : "pipe",
            ff : "timeout",
            gg : {
                hhh : {
                    iiii : "file"
                }
            }
        },
        g : "file"
    };

    var _getEntry = function (path) {
        var p = path.split("/"),
            e = FILESYSTEM,
            i;

        if (p[0] === "") {
            p.shift();
        }

        if (p[p.length - 1] === "") {
            p.pop();
        }

        for (i = 0; i < p.length; ++i) {
            if (p[i] === "") {
                e = null;
                break;
            }

            e = e[p[i]];
            if (!e) {
                break;
            }
        }
        
        return e;
    };

    var join = function (p1, p2) {
        if (p1 !== "" && p2 !== "") {
            if (p1[p1.length - 1] !== "/") {
                p1 = p1 + "/";
            }

            if (p2[0] === "/") {
                p2 = p2.substr(1);
            }
        }
        
        return p1 + p2;
    };

    var statSync = function (path) {
        var e = _getEntry(path);

        if (!e) {
            throw new Error(ERROR_NO_SUCH_ENTRY);
        } else if (e === "error") {
            throw new Error(ERROR_FS_ERROR);
        } else if (e === "timeout") {
            throw new Error(ERROR_TIMEOUT);
        } else {
            return {
                isFile : function () {
                    return e === "file";
                },
                isDirectory : function () {
                    return typeof(e) === "object";
                }
            };
        }
    };

    var listSync = function (path) {
        var e = _getEntry(path);
        if (!e || typeof(e) !== "object") {
            throw new Error(ERROR_FS_ERROR);
        } else {
            return Object.keys(e);
        }
    };

    var _makeAsync = function (syncFunction) {
        return function (param, callback) {
            var delay = Math.floor(Math.random() * DELAY_VARIANCE) + MIN_DELAY,
                result = null,
                error = null;

            try {
                result = syncFunction(param);
            } catch (e) {
                error = e.message;
            }

            if (error !== ERROR_TIMEOUT) {
                setTimeout(function () {
                    callback(error, result);
                }, delay);
            }
        };
    };

    return {
        join : join,
        statSync : statSync,
        listSync : listSync,
        stat : _makeAsync(statSync),
        list : _makeAsync(listSync)
    };
});
