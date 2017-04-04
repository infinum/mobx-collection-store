"use strict";
var DevTools = (function () {
    function DevTools(middlewares, composer) {
        var _this = this;
        this.__middlewares = [];
        middlewares.forEach(function (middleware) {
            if (middleware) {
                console.log(middleware);
                _this.__middlewares.push(middleware(_this.__createStore.bind(_this))(_this.__reducer, _this.store.liftedStore.getState()));
            }
        });
        if (composer) {
            var dispatcher = composer()(this.__createStore.bind(this), {})(this.__reducer, this.store, this.__createStore.bind(this));
            console.log('dispatcher', dispatcher);
            this.__middlewares.push(dispatcher.dispatch);
        }
    }
    DevTools.prototype.__onAction = function (change) {
        var modelJS = change.model.toJS();
        this.__middlewares.map(function (middleware) {
            debugger;
            middleware({
                type: "CHANGE_" + modelJS['__type__'] + "_" + modelJS['id'] + "_" + change.key,
                change: change,
            });
        });
    };
    Object.defineProperty(DevTools.prototype, "store", {
        get: function () {
            var collection = this;
            return {
                liftedStore: {
                    getState: function () {
                        return {
                            collection: collection.toJS(),
                        };
                    },
                    subscribe: function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i - 0] = arguments[_i];
                        }
                        console.log.apply(console, ['subscribe'].concat(args));
                    },
                    dispatch: function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i - 0] = arguments[_i];
                        }
                        console.log.apply(console, ['dispatch'].concat(args));
                    },
                    mapStateToProps: function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i - 0] = arguments[_i];
                        }
                        console.log.apply(console, ['mapStateToProps'].concat(args));
                    },
                    collection: collection,
                }
            };
        },
        enumerable: true,
        configurable: true
    });
    DevTools.prototype.__reducer = function (state, action) {
        console.log('reducer', state, action);
    };
    DevTools.prototype.__createStore = function (creator) {
        var _this = this;
        console.log('createStore', creator, this);
        creator(this.store.liftedStore.getState(), { type: '@@COLLECTION/INIT' });
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            return _this.store;
        };
    };
    return DevTools;
}());
exports.DevTools = DevTools;
