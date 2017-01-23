"use strict";
/** @private @const TYPE_PROP {string} - Name of the type property when the model is converted into POJO */
exports.TYPE_PROP = '__type__';
/** @private @const DEFAULT_TYPE {string} - Type of the default model */
exports.DEFAULT_TYPE = '__default_type__';
/** @private @const RESERVED_KEYS {Array<string>} - List of property names that shouldn't be used in the model */
exports.RESERVED_KEYS = [
    'static', 'assign', 'assignRef', 'update', 'toJS',
    '__collection', '__data', '__getProp', '__initializedProps',
    '__getRef', '__setRef', '__initRefGetter', '__initRefGetters',
    '__partialRefUpdate', '__updateKey'
];
