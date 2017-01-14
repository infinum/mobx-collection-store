import IReferences from './interfaces/IReferences';
import IModel from './interfaces/IModel';
import ICollection from './interfaces/ICollection';
/**
 * MobX Collection Model class
 *
 * @class Model
 * @implements {IModel}
 */
declare class Model implements IModel {
    /**
     * Identifier of the model
     *
     * @type {(string | number)}
     * @memberOf Model
     */
    __id: string | number;
    /**
     * Collection the model belongs to
     *
     * @type {ICollection}
     * @memberOf Model
     */
    __collection?: ICollection;
    /**
     * The attribute that should be used as the unique identifier
     *
     * @static
     * @type {string}
     * @memberOf Model
     */
    static idAttribute: string;
    /**
     * The references that the model can have to other models
     *
     * @static
     * @type {IReferences}
     * @memberOf Model
     */
    static refs: IReferences;
    /**
     * Type of the model
     *
     * @static
     * @type {string}
     * @memberOf Model
     */
    static type: string;
    /**
     * Internal data storage
     *
     * @private
     * @type {IObservableObject}
     * @memberOf Model
     */
    private __data;
    /**
     * Creates an instance of Model.
     *
     * @param {Object} initialData
     * @param {ICollection} [collection]
     *
     * @memberOf Model
     */
    constructor(initialData: Object, collection?: ICollection);
    /**
     * Initialize the reference getters based on the static refs property
     *
     * @private
     *
     * @memberOf Model
     */
    private __initRefGetters();
    /**
     * Getter for the computed referenced model
     *
     * @private
     * @argument {string} ref - Reference name
     * @returns {IComputedValue<IModel>} Getter function
     *
     * @memberOf Model
     */
    private __getRef(ref);
    /**
     * Getter for the computed property value
     *
     * @private
     * @argument {string} key - Property name
     * @returns {IComputedValue<IModel>} Getter function
     *
     * @memberOf Model
     */
    private __getProp(key);
    /**
     * Setter for the referenced model
     * If the value is an object it will be upserted into the collection
     *
     * @private
     * @argument {string} ref - Reference name
     * @argument {IModel|Object|string|number} val - The referenced mode
     * @returns {IModel} Referenced model
     *
     * @memberOf Model
     */
    private __setRef(ref, val);
    /**
     * Static model class
     *
     * @readonly
     * @type {typeof Model}
     * @memberOf Model
     */
    readonly static: typeof Model;
    /**
     * Update the existing model
     *
     * @augments {IModel|Object} data - The new model
     * @returns {Object} Values that have been updated
     *
     * @memberOf Model
     */
    update(data: IModel | Object): Object;
    /**
     * Set a specific model property
     *
     * @argument {string} key - Property to be set
     * @argument {T} value - Value to be set
     * @returns {T|IModel} The set value (Can be an IModel if the value vas a reference)
     *
     * @memberOf Model
     */
    set<T>(key: string, value: T): T | IModel;
    /**
     * Convert the model into a plain JS Object in order to be serialized
     *
     * @returns {Object} Plain JS Object representing the model
     *
     * @memberOf Model
     */
    toJS(): Object;
}
export { Model };
