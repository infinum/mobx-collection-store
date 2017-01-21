"use strict";
var consts_1 = require("./consts");
/**
 * Iterate trough an single item or array of items
 *
 * @export
 * @template T
 * @param {(Object|Array<Object>)} data - Data that needs to be iterated
 * @param {Function} fn - Function to call for every item
 * @returns {(T|Array<T>)} - Result of the iteration (function return value)
 */
function mapItems(data, fn) {
    return data instanceof Array ? data.map(function (item) { return fn(item); }) : fn(data);
}
exports.mapItems = mapItems;
/**
 * Get the first array item
 *
 * @export
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
 * @export
 * @param {IModel} item - Model that's beeing matched
 * @param {string} type - Model type to match
 * @param {(string|number)} id - Model ID to match
 * @returns {boolean} True if the model matches the parameters
 *
 * @memberOf Collection
 */
function matchModel(item, type, id) {
    return getType(item) === type && item[item.static.idAttribute] === id;
}
exports.matchModel = matchModel;
function getType(instance) {
    return instance.static.type === consts_1.DEFAULT_TYPE
        ? instance[instance.static.typeAttribute]
        : instance.static.type;
}
exports.getType = getType;
