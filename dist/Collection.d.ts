import ICollection from './interfaces/ICollection';
import IDictionary from './interfaces/IDictionary';
import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import IType from './interfaces/IType';
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
    private __modelHash;
    /**
     * Creates an instance of Collection.
     *
     * @param {Array<object>} [data=[]]
     *
     * @memberOf Collection
     */
    constructor(data?: Array<object>);
    /**
     * Static model class
     *
     * @readonly
     * @type {typeof Collection}
     * @memberOf Collection
     */
    readonly static: typeof Collection;
    /**
     * Number of unique models in the collection
     *
     * @readonly
     * @type {number}
     * @memberOf Collection
     */
    readonly length: number;
    /**
     * Add a model or list of models to the collection
     *
     * @template T
     * @argument {object|IModel|Array<object>|Array<IModel>} model - The model or array of models to be imported
     * @argument {IType} [type] - The model type to be imported (not relevant if the model is an instance of Model)
     * @returns {IModel|Array<IModel>|T|Array<T>} Model instance(s)
     *
     * @memberOf Collection
     */
    add<T extends IModel>(model: Array<IModel>): Array<T>;
    add<T extends IModel>(model: IModel): T;
    add<T extends IModel>(model: Array<object>, type?: IType): Array<T>;
    add<T extends IModel>(model: object, type?: IType): T;
    /**
     * Find a specific model
     *
     * @template T
     * @argument {IType} type - Type of the model that will be searched for
     * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be returned)
     * @returns {T} Found model
     *
     * @memberOf Collection
     */
    find<T extends IModel>(type: IType, id?: string | number): T;
    /**
     * Find all models of the specified type
     *
     * @template T
     * @argument {IType} type - Type of the models that will be searched for
     * @returns {Array<T>} Found models
     *
     * @memberOf Collection
     */
    findAll<T extends IModel>(type: IType): Array<T>;
    /**
     * Remove a specific model from the collection
     *
     * @template T
     * @argument {IType} type - Type of the model that will be removed
     * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be removed)
     * @returns {T} Removed model
     *
     * @memberOf Collection
     */
    remove<T extends IModel>(type: IType, id?: string | number): T;
    /**
     * Remove all models of the specified type from the collection
     *
     * @template T
     * @argument {IType} type - Type of the models that will be removed
     * @returns {Array<T>} Removed models
     *
     * @memberOf Collection
     */
    removeAll<T extends IModel>(type: IType): Array<T>;
    /**
     * Reset the collection - remove all models
     *
     * @memberOf Collection
     */
    reset(): void;
    /**
     * Convert the collection (and containing models) into a plain JS Object in order to be serialized
     *
     * @returns {Array<IDictionary>} Plain JS Object Array representing the collection and all its models
     *
     * @memberOf Collection
     */
    toJS(): Array<IDictionary>;
    /**
     * Exposed snapshot state of the collection
     *
     * @readonly
     * @memberof Collection
     */
    readonly snapshot: object[];
    /**
     * Get a list of the type models
     *
     * @private
     * @argument {IType} type - Type of the model
     * @returns {IComputedValue<Array<IModel>>} Getter function
     *
     * @memberOf Collection
     */
    private __getByType(type);
    /**
     * Get the model constructor for a given model type
     *
     * @private
     * @argument {IType} type - The model type we need the constructor for
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
     * Prepare the model instance either by finding an existing one or creating a new one
     *
     * @private
     * @param {IModel|Object} model - Model data
     * @param {IType} [type] - Model type
     * @returns {IModel} - Model instance
     *
     * @memberOf Collection
     */
    private __getModelInstance(model, type?);
    /**
     * Remove models from the collection
     *
     * @private
     * @param {Array<IModel>} models - Models to remove
     *
     * @memberOf Collection
     */
    private __removeModels(models);
}
