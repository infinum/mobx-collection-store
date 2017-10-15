"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var consts_1 = require("./consts");
/**
 * Iterate trough an single item or array of items
 *
 * @private
 * @template T
 * @param {(object|Array<object>)} data - Data that needs to be iterated
 * @param {Function} fn - Function to call for every item
 * @returns {(T|Array<T>)} - Result of the iteration (function return value)
 */
function mapItems(data, fn) {
    if (data instanceof Array) {
        return data.map(function (item) { return fn(item); });
    }
    return data === null ? null : fn(data);
}
exports.mapItems = mapItems;
/**
 * Get the first array item
 *
 * @private
 * @param {Array<any>} arr - The array to process
 * @returns {*} First element or null
 */
function first(arr) {
    return arr.length > 0 ? arr[0] : null;
}
exports.first = first;
/**
 * Match a model to defined parameters
 *
 * @private
 * @param {IModel} item - Model that's being matched
 * @param {IType} type - Model type to match
 * @param {(string|number)} id - Model ID to match
 * @returns {boolean} True if the model matches the parameters
 *
 * @memberOf Collection
 */
function matchModel(item, type, id) {
    return getType(item) === type && item[item.static.idAttribute] === id;
}
exports.matchModel = matchModel;
/**
 * Get the dynamic/static model type
 *
 * @private
 * @param {IModel} instance - Model instance
 * @returns Model instance type
 */
function getType(instance) {
    return instance.static.type === consts_1.DEFAULT_TYPE
        ? instance[instance.static.typeAttribute]
        : instance.static.type;
}
exports.getType = getType;
/**
 * Assign objects to the target object
 * Not a complete implementation (Object.assign)
 * Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign polyfill
 *
 * @private
 * @param {object} target - Target object
 * @param {Array<object>} args - Objects to be assigned
 * @returns
 */
function assign(target) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    args.forEach(function (nextSource) {
        if (nextSource != null) {
            for (var nextKey in nextSource) {
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    target[nextKey] = nextSource[nextKey];
                }
            }
        }
    });
    return target;
}
exports.assign = assign;
/**
 * Omits properties from an object
 *
 * @private
 * @param {object} target - Target object
 * @param {Array<string>} paths - Paths to be ommited
 * @returns {object} A new object without paths speciefied in paths argument
 */
function omit(target, paths) {
    if (!paths.length) {
        return target;
    }
    var remainingKeys = Object
        .keys(target)
        .filter(function (key) { return paths.indexOf(key) < 0; });
    return remainingKeys.reduce(function (acc, val) {
        if (target.hasOwnProperty(val)) {
            return assign({}, acc, (_a = {},
                _a[val] = target[val],
                _a));
        }
        return val;
        var _a;
    }, {});
}
exports.omit = omit;
