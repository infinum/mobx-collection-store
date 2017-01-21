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
     * Atribute name for the type attribute
     *
     * @type {string}
     * @memberOf IModelConstructor
     */
    typeAttribute: string;
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
    /**
     * Defines if the model should use autoincrement id if none is defined
     *
     * @type {boolean}
     * @memberOf IModelConstructor
     */
    enableAutoId: boolean;
    /**
     * Function used for generating the autoincrement IDs
     *
     * @returns {number|string} id
     *
     * @memberOf IModelConstructor
     */
    autoIdFunction(): number | string;
    new (initialData: Object, collection?: ICollection): IModel;
}
export default IModelConstructor;
