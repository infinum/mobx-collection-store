"use strict";
function mapItems(data, fn) {
    return data instanceof Array ? data.map(function (item) { return fn(item); }) : fn(data);
}
exports.mapItems = mapItems;
function first(arr) {
    return arr.length > 0 ? arr[0] : null;
}
exports.first = first;
