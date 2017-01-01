"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var mobx_1 = require("mobx");
var Model_1 = require("./Model");
var consts_1 = require("./consts");
var Collection = (function () {
    function Collection(data) {
        if (data === void 0) { data = []; }
        /** Internal data storage */
        this.data = mobx_1.observable([]);
        (_a = this.data).push.apply(_a, data.map(this.__initItem, this));
        var computedProps = {};
        for (var _i = 0, _b = this.static.types; _i < _b.length; _i++) {
            var model = _b[_i];
            computedProps[model.type] = this.__getByType(model.type);
        }
        mobx_1.extendObservable(this, computedProps);
        var _a;
    }
    /**
     * Get a list of the type models
     *
     * @argument {string} type - Type of the model
     * @returns {IComputedValue<Array<IModel>>} Getter function
     */
    Collection.prototype.__getByType = function (type) {
        var _this = this;
        return mobx_1.computed(function () { return _this.data.filter(function (item) { return item.type === type; }); });
    };
    /**
     * Get the model constructor for a given model type
     *
     * @argument {string} type - The model type we need the constructor for
     * @returns {IModelConstructor} The matching model constructor
     */
    Collection.prototype.__getModel = function (type) {
        return this.static.types.filter(function (item) { return item.type === type; })[0] || Model_1.Model;
    };
    /**
     * Initialize a model based on an imported Object
     *
     * @argument {Object} item - Imported model POJO
     * @returns {IModel} The new model
     */
    Collection.prototype.__initItem = function (item) {
        var type = item[consts_1.TYPE_PROP];
        var TypeModel = this.__getModel(type);
        return new TypeModel(item, this);
    };
    Object.defineProperty(Collection.prototype, "static", {
        /** Static model class */
        get: function () {
            return this.constructor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Collection.prototype, "length", {
        /** Number of unique models in the collection */
        get: function () {
            return this.data.length;
        },
        enumerable: true,
        configurable: true
    });
    Collection.prototype.add = function (model, type) {
        var _this = this;
        if (model instanceof Array) {
            return mobx_1.transaction(function () { return model.map(function (item) { return _this.add(item, type); }); });
        }
        var modelInstance;
        if (model instanceof Model_1.Model) {
            modelInstance = model;
            modelInstance.collection = this;
        }
        else {
            var TypeModel = this.__getModel(type);
            modelInstance = new TypeModel(model, this);
        }
        var existing = this.find(modelInstance.type, modelInstance.id);
        if (existing) {
            existing.update(model);
            return existing;
        }
        this.data.push(modelInstance);
        return modelInstance;
    };
    /**
     * Find a specific model
     *
     * @argument {string} type - Type of the model that will be searched for
     * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be returned)
     * @returns {IModel} Found model
     */
    Collection.prototype.find = function (type, id) {
        var modelList = id
            ? this.data.filter(function (item) { return item.type === type && item.id === id; })
            : this.findAll(type);
        return modelList[0] || null;
    };
    /**
     * Find all models of the specified type
     *
     * @argument {string} type - Type of the models that will be searched for
     * @returns {IModel[]} Found models
     */
    Collection.prototype.findAll = function (type) {
        return this.data.filter(function (item) { return item.type === type; });
    };
    /**
     * Remove a specific model from the collection
     *
     * @argument {string} type - Type of the model that will be removed
     * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be removed)
     * @returns {IModel} Removed model
     */
    Collection.prototype.remove = function (type, id) {
        var model = this.find(type, id);
        this.data.remove(model);
        return model;
    };
    /**
     * Remove all models of the specified type from the collection
     *
     * @argument {string} type - Type of the models that will be removed
     * @returns {IModel[]} Removed models
     */
    Collection.prototype.removeAll = function (type) {
        var _this = this;
        var models = this.findAll(type);
        mobx_1.transaction(function () {
            models.forEach(function (model) {
                _this.data.remove(model);
            });
        });
        return models;
    };
    /**
     * Convert the collection (and containing models) into a plain JS Object in order to be serialized
     *
     * @returns {Object} Plain JS Object representing the collection and all its models
     */
    Collection.prototype.toJS = function () {
        return this.data.map(function (item) { return item.toJS(); });
    };
    return Collection;
}());
exports.Collection = Collection;
/** List of custom model types */
Collection.types = [];
__decorate([
    mobx_1.computed
], Collection.prototype, "length", null);
;
