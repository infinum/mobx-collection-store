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
 * Get the specific nested property
 *
 * @export
 * @template T Type of the property value
 * @param {object} obj Source object
 * @param {(string|Array<string>)} key Key value
 * @returns {T} The nested property value
 */
function getProp(obj, key) {
    var path = [].concat(key);
    var val = obj;
    for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
        var pathKey = path_1[_i];
        if (val[pathKey] === undefined) {
            return undefined;
        }
        val = val[pathKey];
    }
    return val;
}
exports.getProp = getProp;
/**
 * Set the specific nested property
 *
 * @export
 * @param {object} obj Destination object
 * @param {(string|Array<string>)} key Key value
 * @param {value} any Value to be set
 */
function setProp(obj, key, value) {
    var path = [].concat(key);
    var lastKey = path.pop();
    var val = obj;
    for (var _i = 0, path_2 = path; _i < path_2.length; _i++) {
        var pathKey = path_2[_i];
        if (typeof val[pathKey] !== 'object') {
            val[pathKey] = {};
        }
        val = val[pathKey];
    }
    val[lastKey] = value;
    return obj;
}
exports.setProp = setProp;
/**
 * Match a model to defined parameters
 *
 * @private
 * @param {IModel} item - Model that's beeing matched
 * @param {IType} type - Model type to match
 * @param {(string|number)} id - Model ID to match
 * @returns {boolean} True if the model matches the parameters
 *
 * @memberOf Collection
 */
function matchModel(item, type, id) {
    /* istanbul ignore next */
    return getType(item) === type && getProp(item, item.static.idAttribute) === id;
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
        ? getProp(instance, instance.static.typeAttribute)
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
        /* istanbul ignore else */
        if (nextSource != null) {
            for (var nextKey in nextSource) {
                /* istanbul ignore else */
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    target[nextKey] = nextSource[nextKey];
                }
            }
        }
    });
    return target;
}
exports.assign = assign;
