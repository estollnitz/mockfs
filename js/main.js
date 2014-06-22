/* global require, $, alert, output: true, mockfs: true */

require.config({
    paths: {
        "CodeMirror" : "../bower_components/codemirror"
    }
});

output = null;
mockfs = null;

define(function (require) {
    "use strict";

    // initialize global mockfs object
    mockfs = require("./mockfs");

    // load CodeMirror and modes
    var CodeMirror = require("CodeMirror/lib/codemirror");
    require("CodeMirror/addon/edit/matchbrackets");
    require("CodeMirror/addon/comment/continuecomment");
    require("CodeMirror/mode/javascript/javascript");

    var examples = require("./examples");

    var LOCAL_STORAGE_CODE_KEY = "code",
        CODE_SAVE_TIMEOUT = 500;

    var _editor;

    var _runHandler = function () {
        var code = _editor.getDoc().getValue();
        /* jshint evil: true */
        eval("(function () {" + code + "}())");
        /* jshint evil: false */
    };

    var _changeEditorSize = function (delta) {
        var $cm = $(".CodeMirror"),
            newHeight = Math.max($cm.height() + delta, 100);

        $cm.height(newHeight);
    };

    var _loadExample = function (exampleFunc) {
        var lines = exampleFunc.toString().split("\n");
        
        // trim off "function () {" and "}""
        lines.splice(0, 1);
        lines.splice(lines.length - 1, 1);

        lines = lines.map(function (l) {
            if (l.indexOf("        ") === 0) {
                return l.substr(8);
            } else {
                return l;
            }
        });
        _editor.getDoc().setValue(lines.join("\n"));
    };

    var _initAutoSave = function () {
        var doSave = function () {
            var code = _editor.getDoc().getValue();
            window.localStorage.setItem(LOCAL_STORAGE_CODE_KEY, code);
        };

        var lastSaveTimer = null;

        _editor.on("change", function () {
            if (lastSaveTimer) {
                clearTimeout(lastSaveTimer);
                lastSaveTimer = null;
            }
            lastSaveTimer = setTimeout(doSave, CODE_SAVE_TIMEOUT);
        });
    };

    var _createOutputFunction = function (outputDiv) {
        return function (toOutput) {
            var s = null,
                pre = document.createElement("pre");

            if (typeof(toOutput) === "object") {
                try {
                    s = JSON.stringify(toOutput, null, "  ");
                } catch (e) { }
            }

            if (!s) {
                s = String(toOutput);
            }

            pre.innerText = s;
            outputDiv.insertBefore(pre, outputDiv.firstElementChild);
        };
    };

    var _setup = function () {
        var codeTextArea = document.getElementById("text-code"),
            runButton = document.getElementById("btn-run"),
            increaseButton = document.getElementById("btn-increase"),
            decreaseButton = document.getElementById("btn-decrease"),
            loadSyncRecursiveButton = document.getElementById("btn-load-sync-recursive"),
            loadListRootButton = document.getElementById("btn-load-list-root"),
            loadStatRootButton = document.getElementById("btn-load-stat-root"),
            loadStatTimeoutButton = document.getElementById("btn-load-stat-timeout"),
            outputDiv = document.getElementById("div-output"),
            previousCode = window.localStorage.getItem(LOCAL_STORAGE_CODE_KEY);

        if (codeTextArea && runButton && increaseButton && decreaseButton &&
            loadSyncRecursiveButton && loadListRootButton && loadStatRootButton &&
            loadStatTimeoutButton && outputDiv) {
            _editor = CodeMirror.fromTextArea(codeTextArea, {
                lineNumbers: true,
                matchBrackets: true,
                continueComments: "Enter",
                indentUnit: 4
            });

            if (previousCode) {
                _editor.getDoc().setValue(previousCode);
            }

            runButton.onclick = _runHandler;

            increaseButton.onclick = function () {
                _changeEditorSize(100);
            };
            decreaseButton.onclick = function () {
                _changeEditorSize(-100);
            };

            loadSyncRecursiveButton.onclick = function () {
                _loadExample(examples.syncRecursive);
            };
            loadListRootButton.onclick = function () {
                _loadExample(examples.listRoot);
            };
            loadStatRootButton.onclick = function () {
                _loadExample(examples.statRoot);
            };
            loadStatTimeoutButton.onclick = function () {
                _loadExample(examples.statTimeout);
            };

            output = _createOutputFunction(outputDiv);

            _initAutoSave();

        } else {
            alert("Unknown initialization error. Things definitely won't work");
        }

        if (navigator.userAgent.indexOf("Chrome/") < 0) {
            alert("This web page is only known to work in Chrome.\n\nProceed at your own risk.");
        }
    };

    if (document.readyState === "complete") {
        _setup();
    } else {
        window.addEventListener("load", _setup);
    }

});
