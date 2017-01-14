import IModel from './IModel';
import ICollection from './ICollection';

/**
 * MobX Collection Model constructor interface
 *
 * @interface IModelConstructor
 */
interface IModelConstructor {

  /**
   * Type of the model
   *
   * @type {string}
   * @memberOf IModelConstructor
   */
  type: string;

  /**
   * The attribute that should be used as the unique identifier
   *
   * @type {string}
   * @memberOf IModelConstructor
   */
  idAttribute: string;

  new (initialData: Object, collection?: ICollection): IModel;
}

export default IModelConstructor;
