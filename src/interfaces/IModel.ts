import {IObservableObject} from 'mobx';

import ICollection from './ICollection';
import IModelConstructor from './IModelConstructor';
import IModelIsEqualParams from './IModelIsEqualParams';
import IPatch from './IPatch';
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
   * Exposed snapshot state of the model
   *
   * @readonly
   * @memberof Model
   */
  snapshot: object;

  /**
   * Update the existing model
   *
   * @augments {IModel|object} data - The new model
   * @returns {object} Values that have been updated
   *
   * @memberOf IModel
   */
  update(data: IModel|object): object;

  /**
   * Set a specific model property
   *
   * @argument {string} key - Property to be set
   * @argument {T} value - Value to be set
   * @returns {T|IModel} The set value (Can be an IModel if the value vas a reference)
   *
   * @memberOf IModel
   */
  assign<T>(key: string, value: T): T|IModel|Array<IModel>;

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
   * Unassign a property from the model
   *
   * @param {string} key A property to unassign
   * @memberof Model
   */
  unassign(key: string): void;

  /**
   * Convert the model into a plain JS Object in order to be serialized
   *
   * @returns {object} Plain JS Object representing the model
   *
   * @memberOf IModel
   */
  toJS(): object;

  /**
   * Add a listener for patches
   *
   * @param {(data: IPatch) => void} listener A new listener
   * @returns {() => void} Function used to remove the listener
   * @memberof Model
   */
  patchListen(listener: (data: IPatch, model: IModel) => void): () => void;

  /**
   * Apply an existing JSONPatch on the model
   *
   * @param {IPatch} patch The patch object
   * @memberof Model
   */
  applyPatch(patch: IPatch): void;

  /**
   * Compares a regular object to a model.
   *
   * @param {object} comparingObject Object that will be compared to the model
   * @param {IModelIsEqualParams} params Options for comparison
   * @returns {boolean} Is the object equal to the model
   * @memberof Model
   */
  isEqual(comparingObject: object, params: IModelIsEqualParams): boolean;
}

export default IModel;
