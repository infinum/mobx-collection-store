"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
var Model_1 = require("./Model");
var consts_1 = require("./consts");
var utils_1 = require("./utils");
/**
 * MobX Collection class
 *
 * @export
 * @class Collection
 * @implements {ICollection}
 */
var Collection = (function () {
    /**
     * Creates an instance of Collection.
     *
     * @param {Array<object>} [data=[]]
     *
     * @memberOf Collection
     */
    function Collection(data) {
        if (data === void 0) { data = []; }
        var _this = this;
        /**
         * Internal data storage
         *
         * @private
         * @type {IObservableArray<IModel>}
         * @memberOf Collection
         */
        this.__data = mobx_1.observable([]);
        mobx_1.runInAction(function () {
            (_a = _this.__data).push.apply(_a, data.map(_this.__initItem, _this));
            var _a;
        });
        var computedProps = {};
        for (var _i = 0, _a = this.static.types; _i < _a.length; _i++) {
            var model = _a[_i];
            computedProps[model.type] = this.__getByType(model.type);
        }
        mobx_1.extendObservable(this, computedProps);
    }
    Object.defineProperty(Collection.prototype, "static", {
        /**
         * Static model class
         *
         * @readonly
         * @type {typeof Collection}
         * @memberOf Collection
         */
        get: function () {
            return this.constructor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Collection.prototype, "length", {
        /**
         * Number of unique models in the collection
         *
         * @readonly
         * @type {number}
         * @memberOf Collection
         */
        get: function () {
            return this.__data.length;
        },
        enumerable: true,
        configurable: true
    });
    Collection.prototype.add = function (model, type) {
        var _this = this;
        if (model instanceof Array) {
            return model.map(function (item) { return _this.add(item, type); });
        }
        var instance = this.__getModelInstance(model, type);
        var id = instance[instance.static.idAttribute];
        var existing = this.find(utils_1.getType(instance), id);
        if (existing) {
            existing.update(model);
            return existing;
        }
        this.__data.push(instance);
        return instance;
    };
    /**
     * Find a specific model
     *
     * @template T
     * @argument {IType} type - Type of the model that will be searched for
     * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be returned)
     * @returns {T} Found model
     *
     * @memberOf Collection
     */
    Collection.prototype.find = function (type, id) {
        return this.__data
            .find(function (item) { return id ? utils_1.matchModel(item, type, id) : utils_1.getType(item) === type; }) || null;
    };
    /**
     * Find all models of the specified type
     *
     * @template T
     * @argument {IType} type - Type of the models that will be searched for
     * @returns {Array<T>} Found models
     *
     * @memberOf Collection
     */
    Collection.prototype.findAll = function (type) {
        return this.__data.filter(function (item) { return utils_1.getType(item) === type; });
    };
    /**
     * Remove a specific model from the collection
     *
     * @template T
     * @argument {IType} type - Type of the model that will be removed
     * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be removed)
     * @returns {T} Removed model
     *
     * @memberOf Collection
     */
    Collection.prototype.remove = function (type, id) {
        var model = this.find(type, id);
        this.__removeModels([model]);
        return model;
    };
    /**
     * Remove all models of the specified type from the collection
     *
     * @template T
     * @argument {IType} type - Type of the models that will be removed
     * @returns {Array<T>} Removed models
     *
     * @memberOf Collection
     */
    Collection.prototype.removeAll = function (type) {
        var models = this.findAll(type);
        this.__removeModels(models);
        return models;
    };
    /**
     * Reset the collection - remove all models
     *
     * @memberOf Collection
     */
    Collection.prototype.reset = function () {
        var models = this.__data.slice();
        this.__removeModels(models);
    };
    /**
     * Convert the collection (and containing models) into a plain JS Object in order to be serialized
     *
     * @returns {Array<IDictionary>} Plain JS Object Array representing the collection and all its models
     *
     * @memberOf Collection
     */
    Collection.prototype.toJS = function () {
        return this.__data.map(function (item) { return item.toJS(); });
    };
    /**
     * Get a list of the type models
     *
     * @private
     * @argument {IType} type - Type of the model
     * @returns {IComputedValue<Array<IModel>>} Getter function
     *
     * @memberOf Collection
     */
    Collection.prototype.__getByType = function (type) {
        var _this = this;
        return mobx_1.computed(function () { return _this.__data.filter(function (item) { return utils_1.getType(item) === type; }); });
    };
    /**
     * Get the model constructor for a given model type
     *
     * @private
     * @argument {IType} type - The model type we need the constructor for
     * @returns {IModelConstructor} The matching model constructor
     *
     * @memberOf Collection
     */
    Collection.prototype.__getModel = function (type) {
        return utils_1.first(this.static.types.filter(function (item) { return item.type === type; })) || Model_1.Model;
    };
    /**
     * Initialize a model based on an imported Object
     *
     * @private
     * @argument {Object} item - Imported model POJO
     * @returns {IModel} The new model
     *
     * @memberOf Collection
     */
    Collection.prototype.__initItem = function (item) {
        var type = item[consts_1.TYPE_PROP];
        var TypeModel = this.__getModel(type);
        return new TypeModel(item, this);
    };
    /**
     * Prepare the model instance either by finding an existing one or creating a new one
     *
     * @private
     * @param {IModel|Object} model - Model data
     * @param {IType} [type] - Model type
     * @returns {IModel} - Model instance
     *
     * @memberOf Collection
     */
    Collection.prototype.__getModelInstance = function (model, type) {
        if (model instanceof Model_1.Model) {
            model.__collection = this;
            return model;
        }
        else {
            var TypeModel = this.__getModel(type);
            return new TypeModel(model, this);
        }
    };
    /**
     * Remove models from the collection
     *
     * @private
     * @param {Array<IModel>} models - Models to remove
     *
     * @memberOf Collection
     */
    Collection.prototype.__removeModels = function (models) {
        var _this = this;
        models.forEach(function (model) {
            if (model) {
                _this.__data.remove(model);
                model.__collection = null;
            }
        });
    };
    return Collection;
}());
/**
 * List of custom model types
 *
 * @static
 * @type {Array<IModelConstructor>}
 * @memberOf Collection
 */
Collection.types = [];
__decorate([
    mobx_1.computed
], Collection.prototype, "length", null);
__decorate([
    mobx_1.action
], Collection.prototype, "add", null);
__decorate([
    mobx_1.action
], Collection.prototype, "removeAll", null);
__decorate([
    mobx_1.action
], Collection.prototype, "reset", null);
__decorate([
    mobx_1.action
], Collection.prototype, "__removeModels", null);
exports.Collection = Collection;
