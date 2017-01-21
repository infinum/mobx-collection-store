import IModel from './interfaces/IModel';

import {DEFAULT_TYPE} from './consts';

/**
 * Iterate trough an single item or array of items
 *
 * @export
 * @template T
 * @param {(Object|Array<Object>)} data - Data that needs to be iterated
 * @param {Function} fn - Function to call for every item
 * @returns {(T|Array<T>)} - Result of the iteration (function return value)
 */
export function mapItems<T>(data: Object|Array<Object>, fn: Function): T|Array<T> {
  return data instanceof Array ? data.map((item) => fn(item)) : fn(data);
}

/**
 * Get the first array item
 *
 * @export
 * @param {Array<any>} arr - The array to process
 * @returns {*} First element or null
 */
export function first(arr: Array<any>): any {
  return arr.length > 0 ? arr[0] : null;
}

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
export function matchModel(item: IModel, type: string, id: string|number): boolean {
  return getType(item) === type && item[item.static.idAttribute] === id;
}

export function getType(instance: IModel) {
  return instance.static.type === DEFAULT_TYPE
    ? instance[instance.static.typeAttribute]
    : instance.static.type;
}

/**
 * Assign objects to the target object
 * Not a complete implementation (Object.assign)
 * Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign polyfill
 *
 * @export
 * @param {Object} target - Target object
 * @param {Array<Object>} args - Objects to be assigned
 * @returns
 */
export function assign(target: Object, ...args: Array<Object>) {
  args.forEach((nextSource) => {
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