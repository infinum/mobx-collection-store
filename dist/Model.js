"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var mobx_1 = require("mobx");
var consts_1 = require("./consts");
var __reservedKeys = [
    'static', 'set', 'update', 'toJS', '__id', '__collection'
];
/**
 * MobX Collection Model class
 *
 * @class Model
 * @implements {IModel}
 */
var Model = (function () {
    /**
     * Creates an instance of Model.
     *
     * @param {Object} initialData
     * @param {ICollection} [collection]
     *
     * @memberOf Model
     */
    function Model(initialData, collection) {
        /**
         * Collection the model belongs to
         *
         * @type {ICollection}
         * @memberOf Model
         */
        this.__collection = null;
        /**
         * Internal data storage
         *
         * @private
         * @type {IObservableObject}
         * @memberOf Model
         */
        this.data = mobx_1.observable({});
        // No need for them to be observable
        this.__id = initialData[this.static.idAttribute];
        this.__collection = collection;
        this.update(initialData);
        this.__initRefGetters();
    }
    /**
     * Initialize the reference getters based on the static refs property
     *
     * @private
     *
     * @memberOf Model
     */
    Model.prototype.__initRefGetters = function () {
        var refGetters = {};
        var refKeys = Object.keys(this.static.refs);
        for (var _i = 0, refKeys_1 = refKeys; _i < refKeys_1.length; _i++) {
            var ref = refKeys_1[_i];
            refGetters[ref] = this.__getRef(ref);
        }
        mobx_1.extendObservable(this, refGetters);
    };
    /**
     * Getter for the computed referenced model
     *
     * @private
     * @argument {string} ref - Reference name
     * @returns {IComputedValue<IModel>} Getter function
     *
     * @memberOf Model
     */
    Model.prototype.__getRef = function (ref) {
        var _this = this;
        return mobx_1.computed(function () { return _this.__collection
            ? _this.__collection.find(_this.static.refs[ref], _this.data[ref])
            : null; });
    };
    /**
     * Getter for the computed property value
     *
     * @private
     * @argument {string} key - Property name
     * @returns {IComputedValue<IModel>} Getter function
     *
     * @memberOf Model
     */
    Model.prototype.__getProp = function (key) {
        var _this = this;
        return mobx_1.computed(function () { return _this.data[key]; });
    };
    /**
     * Setter for the referenced model
     * If the value is an object it will be upserted into the collection
     *
     * @private
     * @argument {string} ref - Reference name
     * @argument {IModel|Object|string|number} val - The referenced mode
     * @returns {IModel} Referenced model
     *
     * @memberOf Model
     */
    Model.prototype.__setRef = function (ref, val) {
        if (val instanceof Model) {
            // Make sure we have the same model in the collection
            var model = this.__collection.add(val);
            this.data[ref] = model.__id;
        }
        else if (typeof val === 'object') {
            // Add the object to collection if it's not a model yet
            var type = this.static.refs[ref];
            var model = this.__collection.add(val, type);
            this.data[ref] = model.__id;
        }
        else {
            // Add a reference to the existing model
            this.data[ref] = val;
        }
        // Find the referenced model in collection
        return this.__collection
            ? this.__collection.find(this.static.refs[ref], this.data[ref])
            : null;
    };
    Object.defineProperty(Model.prototype, "static", {
        /**
         * Static model class
         *
         * @readonly
         * @type {typeof Model}
         * @memberOf Model
         */
        get: function () {
            return this.constructor;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Update the existing model
     *
     * @augments {IModel|Object} data - The new model
     * @returns {Object} Values that have been updated
     *
     * @memberOf Model
     */
    Model.prototype.update = function (data) {
        var _this = this;
        var vals = {};
        var keys = Object.keys(data);
        var idAttribute = this.static.idAttribute;
        keys.forEach(function (key) {
            if (__reservedKeys.indexOf(key) !== -1) {
                // Skip the key because it would override the internal key
                return;
            }
            if (key !== idAttribute || !_this.data[idAttribute]) {
                vals[key] = _this.set(key, data[key]);
            }
        });
        return vals;
    };
    /**
     * Set a specific model property
     *
     * @argument {string} key - Property to be set
     * @argument {T} value - Value to be set
     * @returns {T|IModel} The set value (Can be an IModel if the value vas a reference)
     *
     * @memberOf Model
     */
    Model.prototype.set = function (key, value) {
        var val = value;
        var isRef = key in this.static.refs;
        if (isRef) {
            val = this.__setRef(key, value);
        }
        else {
            this.data[key] = value;
        }
        // Add getter if it doesn't exist yet
        if (!(key in this)) {
            mobx_1.extendObservable(this, (_a = {},
                _a[isRef ? key + "Id" : key] = this.__getProp(key),
                _a));
        }
        return val;
        var _a;
    };
    /**
     * Convert the model into a plain JS Object in order to be serialized
     *
     * @returns {Object} Plain JS Object representing the model
     *
     * @memberOf Model
     */
    Model.prototype.toJS = function () {
        var data = mobx_1.toJS(this.data);
        data[consts_1.TYPE_PROP] = this.static.type;
        return data;
    };
    return Model;
}());
exports.Model = Model;
/**
 * The attribute that should be used as the unique identifier
 *
 * @static
 * @type {string}
 * @memberOf Model
 */
Model.idAttribute = 'id';
/**
 * The references that the model can have to other models
 *
 * @static
 * @type {IReferences}
 * @memberOf Model
 */
Model.refs = {};
/**
 * Type of the model
 *
 * @static
 * @type {string}
 * @memberOf Model
 */
Model.type = consts_1.DEFAULT_TYPE;
__decorate([
    mobx_1.action
], Model.prototype, "___setRef", null);
__decorate([
    mobx_1.action
], Model.prototype, "update", null);
;
