"use strict";
var mobx_1 = require("mobx");
var History = (function () {
    function History() {
        /**
         * History stack
         *
         * @private
         * @type {IObservableArray<IChange>}
         * @memberOf Model
         */
        this.__history = mobx_1.observable([]);
        /**
         * Current position in the history stack
         *
         * @private
         * @type {number}
         * @memberOf Model
         */
        this.__historyPointer = 0;
        /**
         * The flag that determines if the current change should be saved to history
         *
         * @private
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
    /**
     * Save the change to the history stack
     *
     * @protected
     * @param {string} key Changed property
     * @param {*} oldValue Old property value
     * @param {*} newValue New property value
     *
     * @memberOf Model
     */
    History.prototype.__addStep = function (model, key, oldValue, newValue) {
        if (!this.__historyIgnore) {
            var change_1 = { model: model, key: key, oldValue: oldValue, newValue: newValue, timestamp: Date.now() };
            // TODO: Should probably be optimized
            this.__history.replace([change_1].concat(this.__history.slice(this.__historyPointer)));
            this.__historyPointer = 0;
            this.__actionListeners.forEach(function (callback) {
                callback(change_1);
            });
        }
    };
    return History;
}());
exports.History = History;
