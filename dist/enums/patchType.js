"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var patchType;
(function (patchType) {
    patchType["ADD"] = "add";
    patchType["REMOVE"] = "remove";
    patchType["REPLACE"] = "replace";
    patchType["COPY"] = "copy";
    patchType["MOVE"] = "move";
    patchType["TEST"] = "test";
})(patchType || (patchType = {}));
exports.default = patchType;
