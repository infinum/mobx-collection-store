import ICollection from './interfaces/ICollection';
import IDictionary from './interfaces/IDictionary';
import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import IOpts from './interfaces/IOpts';
import IPatch from './interfaces/IPatch';
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
     * A list of all registered patch listeners
     *
     * @private
     * @memberof Model
     */
    private __patchListeners;
    /**
     * Creates an instance of Collection.
     *
     * @param {Array<object>} [data=[]]
     *
     * @memberOf Collection
     */
    constructor(data?: Array<object>);
    /**
     * Insert serialized models into the store
     *
     * @param {(Array<object>|object)} data models to insert
     * @memberof Collection
     */
    insert(data: Array<object> | object): Array<IModel>;
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
     * @argument {IOpts} [type] - The model type to be imported (not relevant if the model is an instance of Model)
     * @returns {IModel|Array<IModel>|T|Array<T>} Model instance(s)
     *
     * @memberOf Collection
     */
    add<T extends IModel>(model: Array<IModel>): Array<T>;
    add<T extends IModel>(model: IModel): T;
    add<T extends IModel>(model: Array<object>, type?: IOpts): Array<T>;
    add<T extends IModel>(model: object, type?: IOpts): T;
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
     * Add a listener for patches
     *
     * @param {(data: IPatch) => void} listener A new listener
     * @returns {() => void} Function used to remove the listener
     * @memberof Collection
     */
    patchListen(listener: (data: IPatch, model: IModel) => void): () => void;
    /**
     * Apply an existing JSONPatch on the model
     *
     * @param {IPatch} patch The patch object
     * @memberof Collection
     */
    applyPatch(patch: IPatch): void;
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
     * @param {IOpts} [type] - Model type
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
    /**
     * Function that creates a patch object and calls all listeners
     *
     * @private
     * @param {patchType} type Action type
     * @param {string} field Field where the action was made
     * @param {*} [value] The new value (if it applies)
     * @memberof Model
     */
    private __triggerChange(type, model, value?, oldValue?);
    /**
     * Pass model patches trough to the collection listeners
     *
     * @private
     * @param {IPatch} patch Model patch object
     * @param {IModel} model Updated model
     * @memberof Collection
     */
    private __onPatchTrigger(patch, model);
}
