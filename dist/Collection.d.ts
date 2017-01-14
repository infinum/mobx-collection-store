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
    private __data;
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
     * @template T
     * @argument {Object|IModel|Array<Object>|Array<IModel>} model - The model or array of models to be imported
     * @argument {string} [type] - The model type to be imported (not relevant if the model is an instance of Model)
     * @returns {IModel|Array<IModel>|T|Array<T>} Model instance(s)
     *
     * @memberOf Collection
     */
    add<T extends IModel>(model: Object, type?: string): T;
    add<T extends IModel>(model: Array<Object>, type?: string): Array<T>;
    add(model: IModel): IModel;
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
     * @template T
     * @argument {string} type - Type of the model that will be searched for
     * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be returned)
     * @returns {T} Found model
     *
     * @memberOf Collection
     */
    find<T extends IModel>(type: string, id?: string | number): T;
    /**
     * Find all models of the specified type
     *
     * @template T
     * @argument {string} type - Type of the models that will be searched for
     * @returns {Array<T>} Found models
     *
     * @memberOf Collection
     */
    findAll<T extends IModel>(type: string): Array<T>;
    /**
     * Remove models from the collection
     *
     * @private
     * @param {Array<IModel>} models - Models to remove
     *
     * @memberOf Collection
     */
    private __removeModels(models);
    /**
     * Remove a specific model from the collection
     *
     * @template T
     * @argument {string} type - Type of the model that will be removed
     * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be removed)
     * @returns {T} Removed model
     *
     * @memberOf Collection
     */
    remove<T extends IModel>(type: string, id?: string | number): T;
    /**
     * Remove all models of the specified type from the collection
     *
     * @template T
     * @argument {string} type - Type of the models that will be removed
     * @returns {Array<T>} Removed models
     *
     * @memberOf Collection
     */
    removeAll<T extends IModel>(type: string): Array<T>;
    /**
     * Reset the collection - remove all models
     *
     * @memberOf Collection
     */
    reset(): void;
    /**
     * Convert the collection (and containing models) into a plain JS Object in order to be serialized
     *
     * @returns {Array<Object>} Plain JS Object Array representing the collection and all its models
     *
     * @memberOf Collection
     */
    toJS(): Array<Object>;
}
