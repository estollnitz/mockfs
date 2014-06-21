/* global require, alert, output: true, mockfs: true */

require.config({
    paths: {
        "CodeMirror" : "../bower_components/codemirror"
    }
});

output = null;
mockfs = null;

define(function (require) {
    "use strict";

    var CodeMirror = require("CodeMirror/lib/codemirror");

    require("CodeMirror/addon/edit/matchbrackets");
    require("CodeMirror/addon/comment/continuecomment");
    require("CodeMirror/mode/javascript/javascript");

    mockfs = require("./mockfs");

    var LOCAL_STORAGE_CODE_KEY = "code";

    var _editor;

    var _runHandler = function () {
        var code = _editor.getDoc().getValue();
        window.localStorage.setItem(LOCAL_STORAGE_CODE_KEY, code);
        /* jshint evil: true */
        eval("(function () {" + code + "}())");
        /* jshint evil: false */
    };

    var _createOutputFunction = function (outputDiv) {
        var hasOutput = false;

        return function (toOutput) {
            var s = null,
                pre = document.createElement("pre"),
                hr = hasOutput ? document.createElement("hr") : null;

            if (typeof(toOutput) === "object") {
                try {
                    s = JSON.stringify(toOutput, null, "  ");
                } catch (e) { }
            }

            if (!s) {
                s = String(toOutput);
            }

            pre.innerText = s;
            if (hr) {
                outputDiv.insertBefore(hr, outputDiv.firstElementChild);
            }
            outputDiv.insertBefore(pre, outputDiv.firstElementChild);

            hasOutput = true;
        };
    };

    var _setup = function () {
        var codeTextArea = document.getElementById("text-code"),
            runButton = document.getElementById("btn-run"),
            outputDiv = document.getElementById("div-output"),
            previousCode = window.localStorage.getItem(LOCAL_STORAGE_CODE_KEY);

        if (codeTextArea && runButton && outputDiv) {
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

            output = _createOutputFunction(outputDiv);

        } else {
            alert("Unknown initialization error. Things definitely won't work");
        }
    };

    if (document.readyState === "complete") {
        _setup();
    } else {
        window.addEventListener("load", _setup);
    }

});
