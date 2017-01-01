import {IObservableObject} from 'mobx';

import ICollection from './ICollection';
import IDictionary from './IDictionary';

interface IModel {

  /** Identifier of the model */
  id: string | number;

  /** Collection the model belongs to */
  collection?: ICollection;

  /** Type of the model */
  type: string;

  /** Model attributes */
  attrs: IDictionary;

  /** Model references */
  refs: Object;

  /**
   * Update the existing model
   *
   * @augments {IModel|Object} data - The new model
   * @returns {Object} Values that have been updated
   */
  update(data: Object): Object;

  /**
   * Set a specific model property
   *
   * @argument {string} key - Property to be set
   * @argument {any} value - Value to be set
   * @returns {any} The set value (Can be an IModel if the value vas a reference)
   */
  set(key: string, value: any): any;

  /**
   * Convert the model into a plain JS Object in order to be serialized
   *
   * @returns {Object} Plain JS Object representing the model
   */
  toJS(): Object;
}

export default IModel;
