import ICollection from './ICollection';
import IModelConstructor from './IModelConstructor';
/**
 * MobX Collection Model instance interface
 *
 * @interface IModel
 */
interface IModel {
    /**
     * Identifier of the model
     *
     * @type {(string | number)}
     * @memberOf IModel
     */
    __id: string | number;
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
    update(data: IModel | Object): Object;
    /**
     * Set a specific model property
     *
     * @argument {string} key - Property to be set
     * @argument {T} value - Value to be set
     * @returns {T|IModel} The set value (Can be an IModel if the value vas a reference)
     *
     * @memberOf IModel
     */
    assign<T>(key: string, value: T): T | IModel;
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
