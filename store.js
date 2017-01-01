var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("interfaces/IModelConstructor", ["require", "exports"], function (require, exports) {
    "use strict";
});
define("interfaces/ICollection", ["require", "exports"], function (require, exports) {
    "use strict";
});
define("interfaces/IDictionary", ["require", "exports"], function (require, exports) {
    "use strict";
    ;
});
define("interfaces/IModel", ["require", "exports"], function (require, exports) {
    "use strict";
});
define("interfaces/IReferences", ["require", "exports"], function (require, exports) {
    "use strict";
    ;
});
define("consts", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.TYPE_PROP = '__type__';
    exports.DEFAULT_TYPE = '__default_type__';
});
define("Model", ["require", "exports", "mobx", "consts"], function (require, exports, mobx_1, consts_1) {
    "use strict";
    var Model = (function () {
        function Model(initialData, collection) {
            var _this = this;
            this.collection = null;
            this.data = mobx_1.observable({});
            this.attrs = mobx_1.observable({});
            this.refs = mobx_1.observable({});
            mobx_1.transaction(function () {
                _this.id = initialData[_this.static.idAttribute];
                _this.collection = collection;
                _this.update(initialData);
                _this.__initRefGetters();
            });
        }
        Model.prototype.__initRefGetters = function () {
            var refGetters = {};
            var refKeys = Object.keys(this.static.refs);
            for (var _i = 0, refKeys_1 = refKeys; _i < refKeys_1.length; _i++) {
                var ref = refKeys_1[_i];
                refGetters[ref] = this.__getRef(ref);
            }
            mobx_1.extendObservable(this.refs, refGetters);
        };
        Model.prototype.__getRef = function (ref) {
            var _this = this;
            return mobx_1.computed(function () { return _this.collection.find(_this.static.refs[ref], _this.data[ref]); });
        };
        Model.prototype.__getProp = function (key) {
            var _this = this;
            return mobx_1.computed(function () { return _this.data[key]; });
        };
        Model.prototype.__setRef = function (ref, val) {
            var _this = this;
            return mobx_1.transaction(function () {
                if (val instanceof Model) {
                    var model = _this.collection.add(val);
                    _this.data[ref] = model.id;
                }
                else if (typeof val === 'object') {
                    var type = _this.static.refs[ref];
                    var model = _this.collection.add(val, type);
                    _this.data[ref] = model.id;
                }
                else {
                    _this.data[ref] = val;
                }
                return _this.collection.find(_this.static.refs[ref], _this.data[ref]);
            });
        };
        Object.defineProperty(Model.prototype, "static", {
            get: function () {
                return this.constructor;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Model.prototype, "type", {
            get: function () {
                return this.static.type;
            },
            enumerable: true,
            configurable: true
        });
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
        Model.prototype.set = function (key, value) {
            var val = value;
            if (key in this.static.refs) {
                val = this.__setRef(key, value);
            }
            else {
                this.data[key] = value;
            }
            if (!(key in this.attrs)) {
                mobx_1.extendObservable(this.attrs, (_a = {},
                    _a[key] = this.__getProp(key),
                    _a));
            }
            return val;
            var _a;
        };
        Model.prototype.toJS = function () {
            var data = mobx_1.toJS(this.data);
            data[consts_1.TYPE_PROP] = this.type;
            return data;
        };
        return Model;
    }());
    exports.Model = Model;
    Model.idAttribute = 'id';
    Model.refs = {};
    Model.type = consts_1.DEFAULT_TYPE;
    ;
});
define("Collection", ["require", "exports", "mobx", "Model", "consts"], function (require, exports, mobx_2, Model_1, consts_2) {
    "use strict";
    var Collection = (function () {
        function Collection(data) {
            if (data === void 0) { data = []; }
            this.types = [];
            this.data = mobx_2.observable([]);
            (_a = this.data).push.apply(_a, data.map(this.__initItem));
            var computedProps = {};
            for (var _i = 0, _b = this.types; _i < _b.length; _i++) {
                var model = _b[_i];
                computedProps[model.type] = this.__getByType(model.type);
            }
            mobx_2.extendObservable(this, computedProps);
            var _a;
        }
        Collection.prototype.__getByType = function (type) {
            var _this = this;
            return mobx_2.computed(function () { return _this.data.filter(function (item) { return item.type === type; }); });
        };
        Collection.prototype.__getModel = function (type) {
            return this.types.filter(function (item) { return item.type === type; })[0] || Model_1.Model;
        };
        Collection.prototype.__initItem = function (item) {
            var type = item[consts_2.TYPE_PROP];
            var TypeModel = this.__getModel(type);
            return new TypeModel(item, this);
        };
        Object.defineProperty(Collection.prototype, "length", {
            get: function () {
                return this.data.length;
            },
            enumerable: true,
            configurable: true
        });
        Collection.prototype.add = function (model, type) {
            var _this = this;
            if (type === void 0) { type = consts_2.DEFAULT_TYPE; }
            if (model instanceof Array) {
                return mobx_2.transaction(function () {
                    return model.map(function (item) { return _this.add(item, type); });
                });
            }
            var modelInstance;
            if (model instanceof Model_1.Model) {
                modelInstance = model;
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
            modelInstance.collection = this;
            return modelInstance;
        };
        Collection.prototype.find = function (type, id) {
            if (id) {
                return this.data.filter(function (item) { return item.type === type && item.id === id; })[0] || null;
            }
            else {
                return this.findAll(type)[0] || null;
            }
        };
        Collection.prototype.findAll = function (type) {
            return this.data.filter(function (item) { return item.type === type; });
        };
        Collection.prototype.remove = function (type, id) {
            var model = this.find(type, id);
            this.data.remove(model);
            return model;
        };
        Collection.prototype.removeAll = function (type) {
            var _this = this;
            var models = this.findAll(type);
            mobx_2.transaction(function () {
                models.forEach(function (model) {
                    _this.data.remove(model);
                });
            });
            return models;
        };
        Collection.prototype.toJS = function () {
            return this.data.map(function (item) { return item.toJS(); });
        };
        return Collection;
    }());
    exports.Collection = Collection;
    __decorate([
        mobx_2.computed
    ], Collection.prototype, "length", null);
    ;
});
define("index", ["require", "exports", "Collection", "Model"], function (require, exports, Collection_1, Model_2) {
    "use strict";
    exports.Collection = Collection_1.Collection;
    exports.Model = Model_2.Model;
});
