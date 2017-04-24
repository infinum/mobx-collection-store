import {
  action, computed, extendObservable,
  IComputedValue, IObservableArray,
  observable, runInAction,
} from 'mobx';

import ICollection from './interfaces/ICollection';
import IDictionary from './interfaces/IDictionary';
import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import IType from './interfaces/IType';
import {Model} from './Model';

import {DEFAULT_TYPE, TYPE_PROP} from './consts';
import {first, getType, matchModel} from './utils';

/**
 * MobX Collection class
 *
 * @export
 * @class Collection
 * @implements {ICollection}
 */
export class Collection implements ICollection {

  /**
   * List of custom model types
   *
   * @static
   * @type {Array<IModelConstructor>}
   * @memberOf Collection
   */
  public static types: Array<IModelConstructor> = [];

  /**
   * Internal data storage
   *
   * @private
   * @type {IObservableArray<IModel>}
   * @memberOf Collection
   */
  private __data: IObservableArray<IModel> = observable([]);

  /**
   * Creates an instance of Collection.
   *
   * @param {Array<Object>} [data=[]]
   *
   * @memberOf Collection
   */
  constructor(data: Array<Object> = []) {
    runInAction(() => {
      this.__data.push(...data.map(this.__initItem, this));
    });

    const computedProps: IDictionary = {};
    for (const model of this.static.types) {
      computedProps[model.type] = this.__getByType(model.type);
    }

    extendObservable(this, computedProps);
  }

  /**
   * Static model class
   *
   * @readonly
   * @type {typeof Collection}
   * @memberOf Collection
   */
  public get static(): typeof Collection {
    return <typeof Collection> this.constructor;
  }

  /**
   * Number of unique models in the collection
   *
   * @readonly
   * @type {number}
   * @memberOf Collection
   */
  @computed public get length(): number {
    return this.__data.length;
  }

  /**
   * Add a model or list of models to the collection
   *
   * @template T
   * @argument {Object|IModel|Array<Object>|Array<IModel>} model - The model or array of models to be imported
   * @argument {IType} [type] - The model type to be imported (not relevant if the model is an instance of Model)
   * @returns {IModel|Array<IModel>|T|Array<T>} Model instance(s)
   *
   * @memberOf Collection
   */
  public add<T extends IModel>(model: Array<IModel>): Array<T>;
  public add<T extends IModel>(model: IModel): T;
  public add<T extends IModel>(model: Array<Object>, type?: IType): Array<T>;
  public add<T extends IModel>(model: Object, type?: IType): T;
  @action public add(model: any, type?: IType) {
    if (model instanceof Array) {
      return model.map((item: IModel|Object) => this.add(item, type));
    }

    const instance: IModel = this.__getModelInstance(model, type);

    const id = instance[instance.static.idAttribute];
    const existing = this.find(getType(instance), id);
    if (existing) {
      existing.update(model);
      return existing;
    }

    this.__data.push(instance);
    return instance;
  }

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
  public find<T extends IModel>(type: IType, id?: string|number): T {
    const modelList: Array<T> = id
      ? this.__data.filter((item) => matchModel(item, type, id)) as Array<T>
      : this.findAll<T>(type);

    return first(modelList) || null;
  }

  /**
   * Find all models of the specified type
   *
   * @template T
   * @argument {IType} type - Type of the models that will be searched for
   * @returns {Array<T>} Found models
   *
   * @memberOf Collection
   */
  public findAll<T extends IModel>(type: IType): Array<T> {
    return this.__data.filter((item) => getType(item) === type) as Array<T>;
  }

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
  public remove<T extends IModel>(type: IType, id?: string|number): T {
    const model = this.find<T>(type, id);
    this.__removeModels([model]);
    return model;
  }

  /**
   * Remove all models of the specified type from the collection
   *
   * @template T
   * @argument {IType} type - Type of the models that will be removed
   * @returns {Array<T>} Removed models
   *
   * @memberOf Collection
   */
  @action public removeAll<T extends IModel>(type: IType): Array<T> {
    const models = this.findAll<T>(type);
    this.__removeModels(models);
    return models;
  }

  /**
   * Reset the collection - remove all models
   *
   * @memberOf Collection
   */
  @action public reset(): void {
    const models = [...this.__data];
    this.__removeModels(models);
  }

  /**
   * Convert the collection (and containing models) into a plain JS Object in order to be serialized
   *
   * @returns {Array<IDictionary>} Plain JS Object Array representing the collection and all its models
   *
   * @memberOf Collection
   */
  public toJS(): Array<IDictionary> {
    return this.__data.map((item) => item.toJS());
  }

  /**
   * Get a list of the type models
   *
   * @private
   * @argument {IType} type - Type of the model
   * @returns {IComputedValue<Array<IModel>>} Getter function
   *
   * @memberOf Collection
   */
  private __getByType(type: IType): IComputedValue<Array<IModel>> {
    return computed(
      () => this.__data.filter((item) => getType(item) === type),
    );
  }

  /**
   * Get the model constructor for a given model type
   *
   * @private
   * @argument {IType} type - The model type we need the constructor for
   * @returns {IModelConstructor} The matching model constructor
   *
   * @memberOf Collection
   */
  private __getModel(type: IType): IModelConstructor {
    return first(this.static.types.filter((item) => item.type === type)) || Model;
  }

  /**
   * Initialize a model based on an imported Object
   *
   * @private
   * @argument {Object} item - Imported model POJO
   * @returns {IModel} The new model
   *
   * @memberOf Collection
   */
  private __initItem(item: IDictionary): IModel {
    const type: IType = item[TYPE_PROP];
    const TypeModel: IModelConstructor = this.__getModel(type);
    return new TypeModel(item, this);
  }

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
  private __getModelInstance(model: IModel|Object, type?: IType): IModel {
    if (model instanceof Model) {
      model.__collection = this;
      return model;
    } else {
      const TypeModel: IModelConstructor = this.__getModel(type);
      return new TypeModel(model, this);
    }
  }

  /**
   * Remove models from the collection
   *
   * @private
   * @param {Array<IModel>} models - Models to remove
   *
   * @memberOf Collection
   */
  @action private __removeModels(models: Array<IModel>): void {
    models.forEach((model) => {
      if (model) {
        this.__data.remove(model);
        model.__collection = null;
      }
    });
  }
}
