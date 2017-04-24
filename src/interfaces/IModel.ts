import {IObservableObject} from 'mobx';

import ICollection from './ICollection';
import IModelConstructor from './IModelConstructor';
import IType from './IType';

/**
 * MobX Collection Model instance interface
 *
 * @interface IModel
 */
interface IModel {

  /**
   * Collection the model belongs to
   *
   * @type {ICollection}
   * @memberOf IModel
   */
  __collection?: ICollection;

  /**
   * Static model class
   *
   * @type {IModelConstructor}
   * @memberOf IModel
   */
  static: IModelConstructor;

  /**
   * Update the existing model
   *
   * @augments {IModel|Object} data - The new model
   * @returns {Object} Values that have been updated
   *
   * @memberOf IModel
   */
  update(data: IModel|Object): Object;

  /**
   * Set a specific model property
   *
   * @argument {string} key - Property to be set
   * @argument {T} value - Value to be set
   * @returns {T|IModel} The set value (Can be an IModel if the value vas a reference)
   *
   * @memberOf IModel
   */
  assign<T>(key: string, value: T): T|IModel;

  /**
   * Assign a new reference to the model
   *
   * @template T
   * @param {string} key - reference name
   * @param {T} value - reference value
   * @param {IType} [type] - reference type
   * @returns {(T|IModel|Array<IModel>)} - referenced model(s)
   *
   * @memberOf Model
   */
  assignRef<T>(key: string, value: T, type?: IType): T|IModel|Array<IModel>;

  /**
   * Convert the model into a plain JS Object in order to be serialized
   *
   * @returns {Object} Plain JS Object representing the model
   *
   * @memberOf IModel
   */
  toJS(): Object;
}

export default IModel;
