import IModel from './interfaces/IModel';
import IType from './interfaces/IType';
/**
 * Iterate trough an single item or array of items
 *
 * @private
 * @template T
 * @param {(object|Array<object>)} data - Data that needs to be iterated
 * @param {Function} fn - Function to call for every item
 * @returns {(T|Array<T>)} - Result of the iteration (function return value)
 */
export declare function mapItems<T>(data: object | Array<object>, fn: (item: any) => T): T | Array<T>;
/**
 * Get the first array item
 *
 * @private
 * @param {Array<any>} arr - The array to process
 * @returns {*} First element or null
 */
export declare function first(arr: Array<any>): any;
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
export declare function matchModel(item: IModel, type: IType, id: string | number): boolean;
/**
 * Get the dynamic/static model type
 *
 * @private
 * @param {IModel} instance - Model instance
 * @returns Model instance type
 */
export declare function getType(instance: IModel): IType;
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
export declare function assign(target: object, ...args: Array<object>): object;
/**
 * Omits properties from an object
 *
 * @private
 * @param {object} target - Target object
 * @param {Array<string>} paths - Paths to be ommited
 * @returns {object} A new object without paths speciefied in paths argument
 */
export declare function omit(target: object, paths: Array<string>): object;
