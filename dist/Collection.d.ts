import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import ICollection from './interfaces/ICollection';
/**
 * MobX Collection class
 *
 * @export
 * @class Collection
 * @implements {ICollection}
 */
export declare class Collection implements ICollection {
    /**
     * List of custom model types
     *
     * @static
     * @type {Array<IModelConstructor>}
     * @memberOf Collection
     */
    static types: Array<IModelConstructor>;
    /**
     * Internal data storage
     *
     * @private
     * @type {IObservableArray<IModel>}
     * @memberOf Collection
     */
    private data;
    /**
     * Creates an instance of Collection.
     *
     * @param {Array<Object>} [data=[]]
     *
     * @memberOf Collection
     */
    constructor(data?: Array<Object>);
    /**
     * Get a list of the type models
     *
     * @private
     * @argument {string} type - Type of the model
     * @returns {IComputedValue<Array<IModel>>} Getter function
     *
     * @memberOf Collection
     */
    private __getByType(type);
    /**
     * Get the model constructor for a given model type
     *
     * @private
     * @argument {string} type - The model type we need the constructor for
     * @returns {IModelConstructor} The matching model constructor
     *
     * @memberOf Collection
     */
    private __getModel(type);
    /**
     * Initialize a model based on an imported Object
     *
     * @private
     * @argument {Object} item - Imported model POJO
     * @returns {IModel} The new model
     *
     * @memberOf Collection
     */
    private __initItem(item);
    /**
     * Static model class
     *
     * @readonly
     * @private
     * @type {typeof Collection}
     * @memberOf Collection
     */
    private readonly static;
    /**
     * Number of unique models in the collection
     *
     * @readonly
     * @type {number}
     * @memberOf Collection
     */
    readonly length: number;
    /**
     * Prepare the model instance either by finding an existing one or creating a new one
     *
     * @private
     * @param {IModel|Object} model - Model data
     * @param {string} [type] - Model type
     * @returns {IModel} - Model instance
     *
     * @memberOf Collection
     */
    private __getModelInstance(model, type?);
    /**
     * Add a model or list of models to the collection
     *
     * @argument {Object|IModel|Array<Object>|Array<IModel>} model - The model or array of models to be imported
     * @argument {string} [type] - The model type to be imported (not relevant if the model is an instance of Model)
     * @returns {IModel|Array<IModel>} Model instance(s)
     *
     * @memberOf Collection
     */
    add(model: Object, type?: string): IModel;
    add(model: IModel): IModel;
    add(model: Array<Object>, type?: string): Array<IModel>;
    add(model: Array<IModel>): Array<IModel>;
    /**
     * Match a model to defined parameters
     *
     * @private
     * @param {IModel} item - Model that's beeing matched
     * @param {string} type - Model type to match
     * @param {(string|number)} id - Model ID to match
     * @returns {boolean} True if the model matches the parameters
     *
     * @memberOf Collection
     */
    private __matchModel(item, type, id);
    /**
     * Find a specific model
     *
     * @argument {string} type - Type of the model that will be searched for
     * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be returned)
     * @returns {IModel} Found model
     *
     * @memberOf Collection
     */
    find(type: string, id?: string | number): IModel;
    /**
     * Find all models of the specified type
     *
     * @argument {string} type - Type of the models that will be searched for
     * @returns {Array<IModel>} Found models
     *
     * @memberOf Collection
     */
    findAll(type: string): Array<IModel>;
    /**
     * Remove a specific model from the collection
     *
     * @argument {string} type - Type of the model that will be removed
     * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be removed)
     * @returns {IModel} Removed model
     *
     * @memberOf Collection
     */
    remove(type: string, id?: string | number): IModel;
    /**
     * Remove all models of the specified type from the collection
     *
     * @argument {string} type - Type of the models that will be removed
     * @returns {Array<IModel>} Removed models
     *
     * @memberOf Collection
     */
    removeAll(type: string): Array<IModel>;
    /**
     * Convert the collection (and containing models) into a plain JS Object in order to be serialized
     *
     * @returns {Array<Object>} Plain JS Object Array representing the collection and all its models
     *
     * @memberOf Collection
     */
    toJS(): Array<Object>;
}
