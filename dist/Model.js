"use strict";
var mobx_1 = require("mobx");
var consts_1 = require("./consts");
var Model = (function () {
    function Model(initialData, collection) {
        var _this = this;
        /** Collection the model belongs to */
        this.collection = null;
        /** Internal data storage */
        this.data = mobx_1.observable({});
        /** Model attributes */
        this.attrs = mobx_1.observable({});
        /** Model references */
        this.refs = mobx_1.observable({});
        mobx_1.transaction(function () {
            // No need for them to be observable
            _this.id = initialData[_this.static.idAttribute];
            _this.collection = collection;
            _this.update(initialData);
            _this.__initRefGetters();
        });
    }
    /**
     * Initialize the reference getters based on the static refs property
     *
     * @returns {undefined}
     */
    Model.prototype.__initRefGetters = function () {
        var refGetters = {};
        var refKeys = Object.keys(this.static.refs);
        for (var _i = 0, refKeys_1 = refKeys; _i < refKeys_1.length; _i++) {
            var ref = refKeys_1[_i];
            refGetters[ref] = this.__getRef(ref);
        }
        mobx_1.extendObservable(this.refs, refGetters);
    };
    /**
     * Getter for the computed referenced model
     *
     * @argument {string} ref - Reference name
     * @returns {IComputedValue<IModel>} Getter function
     */
    Model.prototype.__getRef = function (ref) {
        var _this = this;
        return mobx_1.computed(function () { return _this.collection
            ? _this.collection.find(_this.static.refs[ref], _this.data[ref])
            : null; });
    };
    /**
     * Getter for the computed property value
     *
     * @argument {string} key - Property name
     * @returns {IComputedValue<IModel>} Getter function
     */
    Model.prototype.__getProp = function (key) {
        var _this = this;
        return mobx_1.computed(function () { return _this.data[key]; });
    };
    /**
     * Setter for the referenced model
     * If the value is an object it will be upserted into the collection
     *
     * @argument {string} ref - Reference name
     * @argument {IModel|Object|string|number} val - The referenced mode
     * @returns {IModel} Referenced model
     */
    Model.prototype.__setRef = function (ref, val) {
        var _this = this;
        return mobx_1.transaction(function () {
            if (val instanceof Model) {
                // Make sure we have the same model in the collection
                var model = _this.collection.add(val);
                _this.data[ref] = model.id;
            }
            else if (typeof val === 'object') {
                // Add the object to collection if it's not a model yet
                var type = _this.static.refs[ref];
                var model = _this.collection.add(val, type);
                _this.data[ref] = model.id;
            }
            else {
                // Add a reference to the existing model
                _this.data[ref] = val;
            }
            // Find the referenced model in collection
            return _this.collection
                ? _this.collection.find(_this.static.refs[ref], _this.data[ref])
                : null;
        });
    };
    Object.defineProperty(Model.prototype, "static", {
        /** Static model class */
        get: function () {
            return this.constructor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "type", {
        /** Model type */
        get: function () {
            return this.static.type;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Update the existing model
     *
     * @augments {IModel|Object} data - The new model
     * @returns {Object} Values that have been updated
     */
    Model.prototype.update = function (data) {
        var _this = this;
        var vals = {};
        var dataObj = data instanceof Model ? data.attrs : data;
        var keys = Object.keys(dataObj);
        var idAttribute = this.static.idAttribute;
        mobx_1.transaction(function () {
            keys.forEach(function (key) {
                if (key !== idAttribute || !_this.data[idAttribute]) {
                    vals[key] = _this.set(key, data[key]);
                }
            });
        });
        return vals;
    };
    /**
     * Set a specific model property
     *
     * @argument {string} key - Property to be set
     * @argument {any} value - Value to be set
     * @returns {any} The set value (Can be an IModel if the value vas a reference)
     */
    Model.prototype.set = function (key, value) {
        var val = value;
        if (key in this.static.refs) {
            val = this.__setRef(key, value);
        }
        else {
            this.data[key] = value;
        }
        // Add getter if it doesn't exist yet
        if (!(key in this.attrs)) {
            mobx_1.extendObservable(this.attrs, (_a = {},
                _a[key] = this.__getProp(key),
                _a));
        }
        return val;
        var _a;
    };
    /**
     * Convert the model into a plain JS Object in order to be serialized
     *
     * @returns {Object} Plain JS Object representing the model
     */
    Model.prototype.toJS = function () {
        var data = mobx_1.toJS(this.data);
        data[consts_1.TYPE_PROP] = this.type;
        return data;
    };
    return Model;
}());
exports.Model = Model;
/** The attribute that should be used as the unique identifier */
Model.idAttribute = 'id';
/** The references that the model can have to other models */
Model.refs = {};
/** Type of the model */
Model.type = consts_1.DEFAULT_TYPE;
;
