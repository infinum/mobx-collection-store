"use strict";
var mobx_1 = require("mobx");
var History = (function () {
    function History() {
        /**
         * History stack
         *
         * @protected
         * @type {IObservableArray<IChange>}
         * @memberOf Model
         */
        this.__history = mobx_1.observable([]);
        /**
         * Current position in the history stack
         *
         * @protected
         * @type {number}
         * @memberOf Model
         */
        this.__historyPointer = 0;
        /**
         * The flag that determines if the current change should be saved to history
         *
         * @protected
         * @type {boolean}
         * @memberOf Model
         */
        this.__historyIgnore = false;
        this.__actionListeners = mobx_1.observable.shallowArray([]);
    }
    /**
     * Undo the last model change
     *
     * @memberOf Model
     */
    History.prototype.undo = function () {
        var availableSteps = this.__history.length - this.__historyPointer;
        if (availableSteps > 2) {
            var change = this.__history[this.__historyPointer];
            this.__executeChange(change.key, change.oldValue);
            this.__historyPointer++;
        }
    };
    /**
     * Redo the last model change
     *
     * @memberOf Model
     */
    History.prototype.redo = function () {
        if (this.__historyPointer > 1) {
            this.__historyPointer--;
            var change = this.__history[this.__historyPointer];
            this.__executeChange(change.key, change.newValue);
        }
    };
    History.prototype.onAction = function (callback) {
        var _this = this;
        this.__actionListeners.push(callback);
        return function () {
            _this.__actionListeners.remove(callback);
        };
    };
    /**
     * Execute a change on the model without triggering history
     *
     * @protected
     * @param {any} key Property to change
     * @param {any} value New value
     *
     * @memberOf Model
     */
    History.prototype.__executeChange = function (key, value) {
        var historyStatus = this.__historyIgnore;
        this.__historyIgnore = true;
        this[key] = value; // This change needs to be ignored in history!
        this.__historyIgnore = historyStatus;
    };
    return History;
}());
exports.History = History;
