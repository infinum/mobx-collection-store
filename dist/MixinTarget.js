"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function assignMixin(target, Mixin) {
    var mixin = new Mixin();
    for (var prop in mixin) {
        if (!(prop in target)) {
            target[prop] = mixin[prop];
        }
    }
}
var MixinTarget = (function () {
    function MixinTarget() {
        var _this = this;
        this.static.mixins.map(function (Mix) { return assignMixin(_this, Mix); });
    }
    Object.defineProperty(MixinTarget.prototype, "static", {
        get: function () {
            return this.constructor;
        },
        enumerable: true,
        configurable: true
    });
    MixinTarget.mixins = [];
    return MixinTarget;
}());
exports.MixinTarget = MixinTarget;
