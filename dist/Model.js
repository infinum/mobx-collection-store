"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var mobx_1 = require("mobx");
var consts_1 = require("./consts");
var utils_1 = require("./utils");
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
        if (initialData === void 0) { initialData = {}; }
        /**
         * Collection the model belongs to
         *
         * @type {ICollection}
         * @memberOf Model
         */
        this.__collection = null;
        /**
         * List of properties that were initialized on the model
         *
         * @private
         * @type {Array<string>}
         * @memberOf Model
         */
        this.__initializedProps = [];
        /**
         * The model references
         *
         * @static
         * @type {IReferences}
         * @memberOf Model
         */
        this.__refs = {};
        /**
         * Internal data storage
         *
         * @private
         * @type {IObservableObject}
         * @memberOf Model
         */
        this.__data = mobx_1.observable({});
        var data = utils_1.assign({}, this.static.defaults, this.static.preprocess(initialData));
        this.__ensureId(data, collection);
        // No need for it to be observable
        this.__collection = collection;
        this.__initRefGetters();
        this.update(data);
    }
    /**
     * Function that can process the received data (e.g. from an API) before
     * it's transformed into a model
     *
     * @static
     * @param {Object} [rawData={}] - Raw data
     * @returns {Object} Transformed data
     *
     * @memberOf Model
     */
    Model.preprocess = function (rawData) {
        if (rawData === void 0) { rawData = {}; }
        return rawData;
    };
    /**
     * Function used for generating the autoincrement IDs
     *
     * @static
     * @returns {number|string} id
     *
     * @memberOf Model
     */
    Model.autoIdFunction = function () {
        var id = this.autoincrementValue;
        this.autoincrementValue++;
        return id;
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
        if (data === this) {
            return this; // Nothing to do - don't update with itself
        }
        var vals = {};
        Object.keys(data).forEach(this.__updateKey.bind(this, vals, data));
        return vals;
    };
    /**
     * Set a specific model property
     *
     * @argument {string} key - Property to be set
     * @argument {T} value - Value to be set
     * @returns {T|IModel} The assigned value (Can be an IModel)
     *
     * @memberOf Model
     */
    Model.prototype.assign = function (key, value) {
        var val = value;
        var isRef = key in this.__refs;
        if (isRef) {
            val = this.__setRef(key, value);
        }
        else {
            // TODO: Could be optimised based on __initializedProps?
            mobx_1.extendObservable(this.__data, (_a = {}, _a[key] = value, _a));
        }
        this.__ensureGetter(key);
        return val;
        var _a;
    };
    /**
     * Assign a new reference to the model
     *
     * @template T
     * @param {string} key - reference name
     * @param {T} value - reference value
     * @param {string} [type] - reference type
     * @returns {(T|IModel|Array<IModel>)} - referenced model(s)
     *
     * @memberOf Model
     */
    Model.prototype.assignRef = function (key, value, type) {
        if (key in this.__refs) {
            return this.assign(key, value);
        }
        var item = value instanceof Array ? utils_1.first(value) : value;
        this.__refs[key] = item instanceof Model ? utils_1.getType(item) : type;
        var data = this.__setRef(key, value);
        this.__initRefGetter(key, this.__refs[key]);
        return data;
    };
    /**
     * Convert the model into a plain JS Object in order to be serialized
     *
     * @returns {IDictionary} Plain JS Object representing the model
     *
     * @memberOf Model
     */
    Model.prototype.toJS = function () {
        var data = mobx_1.toJS(this.__data);
        data[consts_1.TYPE_PROP] = utils_1.getType(this);
        return data;
    };
    /**
     * Ensure the new model has a valid id
     *
     * @private
     * @param {any} data - New model object
     * @param {any} [collection] - Collection the model will belong to
     *
     * @memberOf Model
     */
    Model.prototype.__ensureId = function (data, collection) {
        var idAttribute = this.static.idAttribute;
        if (!data[idAttribute]) {
            if (!this.static.enableAutoId) {
                throw new Error(idAttribute + " is required!");
            }
            else {
                do {
                    data[idAttribute] = this.static.autoIdFunction();
                } while (collection && collection.find(utils_1.getType(this), data[idAttribute]));
            }
        }
    };
    /**
     * Add new reference getter/setter to the model
     *
     * @private
     * @param {any} ref - reference name
     *
     * @memberOf Model
     */
    Model.prototype.__initRefGetter = function (ref, type) {
        this.__initializedProps.push(ref, ref + "Id");
        this.__refs[ref] = type || this.static.refs[ref];
        // Make sure the reference is observable, even if there is no default data
        if (!(ref in this.__data)) {
            mobx_1.extendObservable(this.__data, (_a = {}, _a[ref] = null, _a));
        }
        mobx_1.extendObservable(this, (_b = {},
            _b[ref] = this.__getRef(ref),
            _b[ref + "Id"] = this.__getProp(ref),
            _b));
        var _a, _b;
    };
    /**
     * Initialize the reference getters based on the static refs property
     *
     * @private
     *
     * @memberOf Model
     */
    Model.prototype.__initRefGetters = function () {
        var refKeys = Object.keys(this.static.refs);
        for (var _i = 0, refKeys_1 = refKeys; _i < refKeys_1.length; _i++) {
            var ref = refKeys_1[_i];
            this.__initRefGetter(ref);
        }
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
        return mobx_1.computed(function () { return _this.__collection ? _this.__getReferencedModels(ref) : null; }, function (value) { return _this.assign(ref, value); });
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
        return mobx_1.computed(function () { return _this.__data[key]; }, function (value) { return _this.assign(key, value); });
    };
    /**
     * Get the reference id
     *
     * @private
     * @template T
     * @param {string} type - type of the reference
     * @param {T} item - model reference
     * @returns {number|string}
     *
     * @memberOf Model
     */
    Model.prototype.__getValueRefs = function (type, item) {
        if (!item) {
            return null;
        }
        if (typeof item === 'object') {
            var model = this.__collection.add(item, type);
            if (utils_1.getType(model) !== type) {
                throw new Error("The model should be a '" + type + "'");
            }
            return model[model.static.idAttribute];
        }
        return item;
    };
    /**
     * Update the referenced array on push/pull/update
     *
     * @private
     * @param {string} ref - reference name
     * @param {any} change - MobX change object
     * @returns {null} no direct change
     *
     * @memberOf Model
     */
    Model.prototype.__partialRefUpdate = function (ref, change) {
        var type = this.__refs[ref];
        if (change.type === 'splice') {
            var added = change.added.map(this.__getValueRefs.bind(this, type));
            (_a = this.__data[ref]).splice.apply(_a, [change.index, change.removedCount].concat(added));
            return null;
        }
        else if (change.type === 'update') {
            var newValue = this.__getValueRefs(type, change.newValue);
            this.__data[ref][change.index] = newValue;
            return null;
        }
        return change;
        var _a;
    };
    /**
     * Get the model(s) referenced by a key
     *
     * @private
     * @param {string} key - the reference key
     * @returns {(IModel|Array<IModel>)}
     *
     * @memberOf Model
     */
    Model.prototype.__getReferencedModels = function (key) {
        var _this = this;
        var dataModels = utils_1.mapItems(this.__data[key], function (refId) {
            return _this.__collection.find(_this.__refs[key], refId);
        });
        if (dataModels instanceof Array) {
            var data = mobx_1.observable(dataModels);
            mobx_1.intercept(data, function (change) { return _this.__partialRefUpdate(key, change); });
            return data;
        }
        return dataModels;
    };
    /**
     * Setter for the referenced model
     * If the value is an object it will be upserted into the collection
     *
     * @private
     * @argument {string} ref - Reference name
     * @argument {T} val - The referenced mode
     * @returns {IModel} Referenced model
     *
     * @memberOf Model
     */
    Model.prototype.__setRef = function (ref, val) {
        var type = this.__refs[ref];
        var refs = utils_1.mapItems(val, this.__getValueRefs.bind(this, type));
        // TODO: Could be optimised based on __initializedProps?
        mobx_1.extendObservable(this.__data, (_a = {}, _a[ref] = refs, _a));
        // Handle the case when the ref is unsetted
        if (!refs) {
            return null;
        }
        // Find the referenced model(s) in collection
        return this.__collection ? this.__getReferencedModels(ref) : null;
        var _a;
    };
    /**
     * Update the model property
     *
     * @private
     * @param {any} vals - An object of all updates
     * @param {any} data - Data used to update
     * @param {any} key - Key to be updated
     * @returns
     *
     * @memberOf Model
     */
    Model.prototype.__updateKey = function (vals, data, key) {
        var idAttribute = this.static.idAttribute;
        if (consts_1.RESERVED_KEYS.indexOf(key) !== -1) {
            return; // Skip the key because it would override the internal key
        }
        if (key !== idAttribute || !this.__data[idAttribute]) {
            vals[key] = this.assign(key, data[key]);
        }
    };
    /**
     * Add getter if it doesn't exist yet
     *
     * @private
     * @param {string} key
     *
     * @memberOf Model
     */
    Model.prototype.__ensureGetter = function (key) {
        if (this.__initializedProps.indexOf(key) === -1) {
            this.__initializedProps.push(key);
            mobx_1.extendObservable(this, (_a = {}, _a[key] = this.__getProp(key), _a));
        }
        var _a;
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
 * Default values of model props
 *
 * @static
 * @type {IDictionary}
 * @memberOf Model
 */
Model.defaults = {};
/**
 * Type of the model
 *
 * @static
 * @type {string}
 * @memberOf Model
 */
Model.type = consts_1.DEFAULT_TYPE;
/**
 * Atribute name for the type attribute
 *
 * @static
 * @type {string}
 * @memberOf Model
 */
Model.typeAttribute = consts_1.TYPE_PROP;
/**
 * Defines if the model should use autoincrement id if none is defined
 *
 * @static
 * @type {boolean}
 * @memberOf Model
 */
Model.enableAutoId = true;
/**
 * Autoincrement counter used for the builtin function
 *
 * @private
 * @static
 *
 * @memberOf Model
 */
Model.autoincrementValue = 1;
__decorate([
    mobx_1.action
], Model.prototype, "update", null);
__decorate([
    mobx_1.action
], Model.prototype, "assign", null);
__decorate([
    mobx_1.action
], Model.prototype, "assignRef", null);
__decorate([
    mobx_1.action
], Model.prototype, "___partialRefUpdate", null);
