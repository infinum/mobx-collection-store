/** @private @const ID_PROP {string} - Name of the id property when the model is converted into POJO */
export const ID_PROP: string = '__id__';

/** @private @const TYPE_PROP {string} - Name of the type property when the model is converted into POJO */
export const TYPE_PROP: string = '__type__';

/** @private @const DEFAULT_TYPE {string} - Type of the default model */
export const DEFAULT_TYPE: string = '__default_type__';

/** @private @const RESERVED_KEYS {Array<string>} - List of property names that shouldn't be used in the model */
export const RESERVED_KEYS: Array<string> = [
  'static', 'assign', 'assignRef', 'update', 'toJS',
  '__collection', '__data', '__getProp', '__initializedProps',
  '__getRef', '__setRef', '__initRefGetter', '__initRefGetters',
  '__partialRefUpdate', '__updateKey',
];
