import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import ICollection from './interfaces/ICollection';
export declare class Collection implements ICollection {
    /** List of custom model types */
    static types: Array<IModelConstructor>;
    /** Internal data storage */
    private data;
    constructor(data?: Array<Object>);
    /**
     * Get a list of the type models
     *
     * @argument {string} type - Type of the model
     * @returns {IComputedValue<Array<IModel>>} Getter function
     */
    private __getByType(type);
    /**
     * Get the model constructor for a given model type
     *
     * @argument {string} type - The model type we need the constructor for
     * @returns {IModelConstructor} The matching model constructor
     */
    private __getModel(type);
    /**
     * Initialize a model based on an imported Object
     *
     * @argument {Object} item - Imported model POJO
     * @returns {IModel} The new model
     */
    private __initItem(item);
    /** Static model class */
    private readonly static;
    /** Number of unique models in the collection */
    readonly length: number;
    /**
     * Add a model or list of models to the collection
     *
     * @argument {Object|IModel|Array<Object>|Array<IModel>} model - The model or array of models to be imported
     * @argument {string} [type] - The model type to be imported (not relevant if the model is an instance of Model)
     * @returns {IModel|IModel[]} Model instance(s)
     */
    add(model: Object, type?: string): IModel;
    add(model: IModel): IModel;
    add(model: Array<Object>, type?: string): Array<IModel>;
    add(model: Array<IModel>): Array<IModel>;
    /**
     * Find a specific model
     *
     * @argument {string} type - Type of the model that will be searched for
     * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be returned)
     * @returns {IModel} Found model
     */
    find(type: string, id?: string | number): IModel;
    /**
     * Find all models of the specified type
     *
     * @argument {string} type - Type of the models that will be searched for
     * @returns {IModel[]} Found models
     */
    findAll(type: string): Array<IModel>;
    /**
     * Remove a specific model from the collection
     *
     * @argument {string} type - Type of the model that will be removed
     * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be removed)
     * @returns {IModel} Removed model
     */
    remove(type: string, id?: string | number): IModel;
    /**
     * Remove all models of the specified type from the collection
     *
     * @argument {string} type - Type of the models that will be removed
     * @returns {IModel[]} Removed models
     */
    removeAll(type: string): Array<IModel>;
    /**
     * Convert the collection (and containing models) into a plain JS Object in roder to be serialized
     *
     * @returns {Object} Plain JS Object representing the collection and all its models
     */
    toJS(): Array<Object>;
}
