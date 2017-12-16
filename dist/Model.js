"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
var patchType_1 = require("./enums/patchType");
var Collection_1 = require("./Collection");
var consts_1 = require("./consts");
var utils_1 = require("./utils");
/**
 * MobX Collection Model class
 *
 * @class Model
 * @implements {IModel}
 */
var Model = /** @class */ (function () {
    function Model(initialData, opts, collection) {
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
        /**
         * A list of all registered patch listeners
         *
         * @private
         * @memberof Model
         */
        this.__patchListeners = [];
        /**
         * Determines if the patch listeners should be called on change
         *
         * @private
         * @type {boolean}
         * @memberof Model
         */
        this.__silent = true;
        var data = utils_1.assign({}, this.static.defaults, this.static.preprocess(initialData));
        var collectionInstance = collection;
        var idAttribute = this.static.idAttribute;
        var idSet = false;
        if (opts instanceof Collection_1.Collection) {
            collectionInstance = opts;
        }
        else if (typeof opts === 'string' || typeof opts === 'number') {
            utils_1.setProp(data, this.static.typeAttribute, opts);
        }
        else if (opts && typeof opts === 'object') {
            if (opts.type) {
                utils_1.setProp(data, this.static.typeAttribute, opts.type);
            }
            if (opts.id || opts.id === 0) {
                utils_1.setProp(data, idAttribute, opts.id);
                idSet = true;
            }
        }
        if (!idSet) {
            this.__ensureId(data, collectionInstance);
            utils_1.setProp({}, idAttribute, utils_1.getProp(data, idAttribute));
        }
        // No need for it to be observable
        this.__collection = collectionInstance;
        this.__initRefGetters();
        this.update(data);
        this.__silent = false;
    }
    /**
     * Function that can process the received data (e.g. from an API) before
     * it's transformed into a model
     *
     * @static
     * @param {object} [rawData={}] - Raw data
     * @returns {object} Transformed data
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
     * @augments {IModel|object} data - The new model
     * @returns {object} Values that have been updated
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
            var patchAction = key in this.__data ? patchType_1.default.REPLACE : patchType_1.default.ADD;
            var oldValue = this.__data[key];
            // TODO: Could be optimised based on __initializedProps?
            mobx_1.extendObservable(this.__data, (_a = {}, _a[key] = value, _a));
            this.__triggerChange(patchAction, key, value, oldValue);
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
     * @param {IType} [type] - reference type
     * @returns {(T|IModel|Array<IModel>)} - referenced model(s)
     *
     * @memberOf Model
     */
    Model.prototype.assignRef = function (key, value, type) {
        /* istanbul ignore next */
        if (typeof this.static.refs[key] === 'object') {
            throw new Error(key + ' is an external reference');
        }
        if (key in this.__refs) {
            return this.assign(key, value);
        }
        var item = value instanceof Array ? utils_1.first(value) : value;
        this.__refs[key] = item instanceof Model ? utils_1.getType(item) : type;
        var data = this.__setRef(key, value);
        this.__initRefGetter(key, this.__refs[key]);
        this.__triggerChange(patchType_1.default.ADD, key, data);
        return data;
    };
    /**
     * Unassign a property from the model
     *
     * @param {string} key A property to unassign
     * @memberof Model
     */
    Model.prototype.unassign = function (key) {
        var oldValue = this.__data[key];
        delete this.__data[key];
        this.__triggerChange(patchType_1.default.REMOVE, key, undefined, oldValue);
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
    Object.defineProperty(Model.prototype, "snapshot", {
        /**
         * Exposed snapshot state of the model
         *
         * @readonly
         * @memberof Model
         */
        get: function () {
            return this.toJS();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Add a listener for patches
     *
     * @param {(data: IPatch) => void} listener A new listener
     * @returns {() => void} Function used to remove the listener
     * @memberof Model
     */
    Model.prototype.patchListen = function (listener) {
        var _this = this;
        this.__patchListeners.push(listener);
        return function () {
            _this.__patchListeners = _this.__patchListeners.filter(function (item) { return item !== listener; });
        };
    };
    /**
     * Apply an existing JSONPatch on the model
     *
     * @param {IPatch} patch The patch object
     * @memberof Model
     */
    Model.prototype.applyPatch = function (patch) {
        var field = patch.path.slice(1);
        /* istanbul ignore else */
        if (patch.op === patchType_1.default.ADD || patch.op === patchType_1.default.REPLACE) {
            this.assign(field, patch.value);
        }
        else if (patch.op === patchType_1.default.REMOVE) {
            this.unassign(field);
        }
    };
    Model.prototype.getRecordId = function () {
        return utils_1.getProp(this, this.static.idAttribute);
    };
    Model.prototype.getRecordType = function () {
        return utils_1.getProp(this, this.static.typeAttribute) || this.static.type;
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
        var id = utils_1.getProp(data, idAttribute);
        if (!id) {
            if (!this.static.enableAutoId) {
                throw new Error(idAttribute + " is required!");
            }
            else {
                var newId = void 0;
                do {
                    newId = this.static.autoIdFunction();
                    var idProp = utils_1.setProp(data, idAttribute, newId);
                } while (collection && collection.find(utils_1.getType(this), newId));
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
        var staticRef = this.static.refs[ref];
        if (typeof staticRef === 'object') {
            mobx_1.extendObservable(this, (_a = {},
                _a[ref] = this.__getExternalRef(staticRef),
                _a));
        }
        else {
            this.__initializedProps.push(ref, ref + "Id");
            this.__refs[ref] = type || staticRef;
            // Make sure the reference is observable, even if there is no default data
            if (!(ref in this.__data)) {
                mobx_1.extendObservable(this.__data, (_b = {}, _b[ref] = null, _b));
            }
            mobx_1.extendObservable(this, (_c = {},
                _c[ref] = this.__getRef(ref),
                _c[ref + "Id"] = this.__getProp(ref),
                _c));
        }
        var _a, _b, _c;
    };
    /**
     * An calculated external reference getter
     *
     * @private
     * @param {IExternalRef} ref - Reference definition
     * @returns {(IComputedValue<IModel|Array<IModel>>)}
     *
     * @memberof Model
     */
    Model.prototype.__getExternalRef = function (ref) {
        var _this = this;
        return mobx_1.computed(function () {
            return !_this.__collection ? [] : _this.__collection.findAll(ref.model)
                .filter(function (model) {
                var prop = model[ref.property];
                if (prop instanceof Array || mobx_1.isObservableArray(prop)) {
                    return prop.indexOf(_this) !== -1;
                }
                else {
                    return prop === _this;
                }
            });
        });
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
     * @param {IType} type - type of the reference
     * @param {T} item - model reference
     * @returns {number|string}
     *
     * @memberOf Model
     */
    Model.prototype.__getValueRefs = function (type, item) {
        /* istanbul ignore next */
        if (!item) {
            return null;
        }
        if (typeof item === 'object') {
            var model = this.__collection.add(item, type);
            if (utils_1.getType(model) !== type) {
                throw new Error("The model should be a '" + type + "'");
            }
            return utils_1.getProp(model, model.static.idAttribute);
        }
        return item;
    };
    /**
     * Update the referenced array on push/pull/update
     *
     * @private
     * @param {IType} ref - reference name
     * @param {any} change - MobX change object
     * @returns {null} no direct change
     *
     * @memberOf Model
     */
    Model.prototype.__partialRefUpdate = function (ref, change) {
        var type = this.__refs[ref];
        /* istanbul ignore else */
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
        /* istanbul ignore next */
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
        var _this = this;
        var isArray = val instanceof Array || mobx_1.isObservableArray(val);
        var hasModelInstances = isArray
            ? val.some(function (item) { return item instanceof Model; })
            : val instanceof Model;
        if (!this.__collection && hasModelInstances) {
            throw new Error('Model needs to be in a collection to set a reference');
        }
        var type = this.__refs[ref];
        var refs = utils_1.mapItems(val, this.__getValueRefs.bind(this, type));
        var getRef = function () { return _this.__collection ? (_this.__getReferencedModels(ref) || undefined) : undefined; };
        var oldValue = getRef();
        var patchAction = oldValue === undefined ? patchType_1.default.ADD : patchType_1.default.REPLACE;
        // TODO: Could be optimised based on __initializedProps?
        mobx_1.extendObservable(this.__data, (_a = {}, _a[ref] = refs, _a));
        var newValue = getRef();
        this.__triggerChange(newValue === undefined ? patchType_1.default.REMOVE : patchAction, ref, newValue, oldValue);
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
        if (key !== idAttribute || !utils_1.getProp(this.__data, idAttribute)) {
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
    /**
     * Function that creates a patch object and calls all listeners
     *
     * @private
     * @param {patchType} type Action type
     * @param {string} field Field where the action was made
     * @param {*} [value] The new value (if it applies)
     * @memberof Model
     */
    Model.prototype.__triggerChange = function (type, field, value, oldValue) {
        var _this = this;
        if (this.__silent) {
            return;
        }
        if (type === patchType_1.default.REPLACE && value === oldValue) {
            return;
        }
        var patchObj = {
            oldValue: oldValue,
            op: type,
            path: "/" + field,
            value: value,
        };
        this.__patchListeners.forEach(function (listener) { return typeof listener === 'function' && listener(patchObj, _this); });
        if (this.__collection) {
            // tslint:disable-next-line:no-string-literal
            this.__collection['__onPatchTrigger'](patchObj, this);
        }
    };
    /**
     * The attribute that should be used as the unique identifier
     *
     * @static
     * @type {string|Array<string>}
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
     * @type {IType}
     * @memberOf Model
     */
    Model.type = consts_1.DEFAULT_TYPE;
    /**
     * Atribute name for the type attribute
     *
     * @static
     * @type {string|Array<string>}
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
     * @public
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
    ], Model.prototype, "unassign", null);
    __decorate([
        mobx_1.computed
    ], Model.prototype, "snapshot", null);
    __decorate([
        mobx_1.action
    ], Model.prototype, "__partialRefUpdate", null);
    return Model;
}());
exports.Model = Model;
