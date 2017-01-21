import IModel from './interfaces/IModel';
/**
 * Iterate trough an single item or array of items
 *
 * @export
 * @template T
 * @param {(Object|Array<Object>)} data - Data that needs to be iterated
 * @param {Function} fn - Function to call for every item
 * @returns {(T|Array<T>)} - Result of the iteration (function return value)
 */
export declare function mapItems<T>(data: Object | Array<Object>, fn: Function): T | Array<T>;
/**
 * Get the first array item
 *
 * @export
 * @param {Array<any>} arr - The array to process
 * @returns {*} First element or null
 */
export declare function first(arr: Array<any>): any;
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
export declare function matchModel(item: IModel, type: string, id: string | number): boolean;
export declare function getType(instance: IModel): any;
