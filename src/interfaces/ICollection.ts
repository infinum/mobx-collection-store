import IModel from './IModel';
import IModelConstructor from './IModelConstructor';
import IPatch from './IPatch';
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
   * Exposed snapshot state of the collection
   *
   * @readonly
   * @memberof Collection
   */
  snapshot: Array<object>;

  /**
   * Insert serialized models into the store
   *
   * @param {(Array<object>|object)} data models to insert
   * @memberof Collection
   */
  insert(data: Array<object>|object): Array<IModel>;

  /**
   * Add a model or list of models to the collection
   *
   * @argument {object|IModel|Array<object>|Array<IModel>} model - The model or array of models to be imported
   * @argument {IType} [type] - The model type to be imported (not relevant if the model is an instance of Model)
   * @returns {IModel|Array<IModel>} Model instance(s)
   *
   * @memberOf ICollection
   */
  add(model: object, type?: IType): IModel;
  add(model: IModel): IModel;
  add(model: Array<object>, type?: IType): Array<IModel>;
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
  findAll(type: IType, searchObject?: object, searchParams?: object): Array<IModel>;

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
   * @returns {Array<object>} Plain JS Object Array representing the collection and all its models
   *
   * @memberOf ICollection
   */
  toJS(): Array<object>;

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
}

export default ICollection;
