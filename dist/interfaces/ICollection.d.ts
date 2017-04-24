import IModel from './IModel';
import IType from './IType';
/**
 * MobX Collection interface
 *
 * @interface ICollection
 */
interface ICollection {
    /**
     * Number of unique models in the collection
     *
     * @type {number}
     * @memberOf ICollection
     */
    length: number;
    /**
     * Add a model or list of models to the collection
     *
     * @argument {Object|IModel|Array<Object>|Array<IModel>} model - The model or array of models to be imported
     * @argument {IType} [type] - The model type to be imported (not relevant if the model is an instance of Model)
     * @returns {IModel|Array<IModel>} Model instance(s)
     *
     * @memberOf ICollection
     */
    add(model: Object, type?: IType): IModel;
    add(model: IModel): IModel;
    add(model: Array<Object>, type?: IType): Array<IModel>;
    add(model: Array<IModel>): Array<IModel>;
    /**
     * Find a specific model
     *
     * @argument {IType} type - Type of the model that will be searched for
     * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be returned)
     * @returns {IModel} Found model
     *
     * @memberOf ICollection
     */
    find(type: IType, id?: string | number): IModel;
    /**
     * Find all models of the specified type
     *
     * @argument {IType} type - Type of the models that will be searched for
     * @returns {IModel[]} Found models
     *
     * @memberOf ICollection
     */
    findAll(type: IType): Array<IModel>;
    /**
     * Remove a specific model from the collection
     *
     * @argument {IType} type - Type of the model that will be removed
     * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be removed)
     * @returns {IModel} Removed model
     *
     * @memberOf ICollection
     */
    remove(type: IType, id?: string | number): IModel;
    /**
     * Remove all models of the specified type from the collection
     *
     * @argument {IType} type - Type of the models that will be removed
     * @returns {IModel[]} Removed models
     *
     * @memberOf ICollection
     */
    removeAll(type: IType): Array<IModel>;
    /**
     * Reset the collection - remove all models
     *
     * @memberOf ICollection
     */
    reset(): void;
    /**
     * Convert the collection (and containing models) into a plain JS Object in order to be serialized
     *
     * @returns {Array<Object>} Plain JS Object Array representing the collection and all its models
     *
     * @memberOf ICollection
     */
    toJS(): Array<Object>;
}
export default ICollection;
