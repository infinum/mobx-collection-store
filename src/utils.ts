import IModel from './interfaces/IModel';
import IType from './interfaces/IType';

import {DEFAULT_TYPE} from './consts';

/**
 * Iterate trough an single item or array of items
 *
 * @private
 * @template T
 * @param {(object|Array<object>)} data - Data that needs to be iterated
 * @param {Function} fn - Function to call for every item
 * @returns {(T|Array<T>)} - Result of the iteration (function return value)
 */
export function mapItems<T>(data: object|Array<object>|null, fn: (item: any) => T): T|Array<T> {
  if (data instanceof Array) {
    return data.map((item) => fn(item));
  }
  return data === null ? null : fn(data);
}

/**
 * Get the first array item
 *
 * @private
 * @param {Array<any>} arr - The array to process
 * @returns {*} First element or null
 */
export function first(arr: Array<any>): any {
  return arr.length > 0 ? arr[0] : null;
}

/**
 * Get the specific nested property
 *
 * @export
 * @template T Type of the property value
 * @param {object} obj Source object
 * @param {(string|Array<string>)} key Key value
 * @returns {T} The nested property value
 */
export function getProp<T>(obj: object, key: string|Array<string>): T {
  const path = [].concat(key);
  let val: object|T = obj;
  for (const pathKey of path) {
    if (val[pathKey] === undefined) {
      return undefined;
    }
    val = val[pathKey];
  }
  return val as T;
}

/**
 * Set the specific nested property
 *
 * @export
 * @param {object} obj Destination object
 * @param {(string|Array<string>)} key Key value
 * @param {value} any Value to be set
 */
export function setProp(obj: object, key: string|Array<string>, value: any): object {
  const path = [].concat(key);
  const lastKey = path.pop();
  let val: object = obj;
  for (const pathKey of path) {
    if (typeof val[pathKey] !== 'object') {
      val[pathKey] = {};
    }
    val = val[pathKey];
  }
  val[lastKey] = value;
  return obj;
}

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
export function matchModel(item: IModel, type: IType, id: string|number): boolean {

  /* istanbul ignore next */
  return getType(item) === type && getProp<string|number>(item, item.static.idAttribute) === id;
}

/**
 * Get the dynamic/static model type
 *
 * @private
 * @param {IModel} instance - Model instance
 * @returns Model instance type
 */
export function getType(instance: IModel): IType {
  return instance.static.type === DEFAULT_TYPE
    ? getProp<IType>(instance, instance.static.typeAttribute)
    : instance.static.type;
}

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
export function assign(target: object, ...args: Array<object>) {
  args.forEach((nextSource) => {

    /* istanbul ignore else */
    if (nextSource != null) {
      for (const nextKey in nextSource) {

        /* istanbul ignore else */
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          target[nextKey] = nextSource[nextKey];
        }
      }
    }
  });
  return target;
}
