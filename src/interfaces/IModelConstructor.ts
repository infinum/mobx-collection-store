import IModel from './IModel';
import ICollection from './ICollection';
import IDictionary from './IDictionary';

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

  /**
   * Default values of model props
   *
   * @type {IDictionary}
   * @memberOf IModelConstructor
   */
  defaults: IDictionary;

  new (initialData: Object, collection?: ICollection): IModel;
}

export default IModelConstructor;
