import {
  extendObservable, observable, computed, action, runInAction,
  IComputedValue, IObservableArray
} from 'mobx';

import IModel from './interfaces/IModel';
import IDictionary from './interfaces/IDictionary';
import IModelConstructor from './interfaces/IModelConstructor';
import ICollection from './interfaces/ICollection';
import {Model} from './Model';
import {TYPE_PROP, DEFAULT_TYPE} from './consts';
import {first, matchModel, getType} from './utils';

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
  static types: Array<IModelConstructor> = []

  /**
   * Internal data storage
   *
   * @private
   * @type {IObservableArray<IModel>}
   * @memberOf Collection
   */
  private __data: IObservableArray<IModel> = observable([])

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
   * Get a list of the type models
   *
   * @private
   * @argument {string} type - Type of the model
   * @returns {IComputedValue<Array<IModel>>} Getter function
   *
   * @memberOf Collection
   */
  private __getByType(type: string): IComputedValue<Array<IModel>> {
    return computed(
      () => this.__data.filter((item) => getType(item) === type)
    );
  }

  /**
   * Get the model constructor for a given model type
   *
   * @private
   * @argument {string} type - The model type we need the constructor for
   * @returns {IModelConstructor} The matching model constructor
   *
   * @memberOf Collection
   */
  private __getModel(type : string): IModelConstructor {
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
    const type = item[TYPE_PROP];
    const TypeModel: IModelConstructor = this.__getModel(type);
    return new TypeModel(item, this);
  }

  /**
   * Static model class
   *
   * @readonly
   * @type {typeof Collection}
   * @memberOf Collection
   */
  get static(): typeof Collection {
    return <typeof Collection>this.constructor;
  }

  /**
   * Number of unique models in the collection
   *
   * @readonly
   * @type {number}
   * @memberOf Collection
   */
  @computed get length(): number {
    return this.__data.length;
  }

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
  private __getModelInstance(model: IModel|Object, type?: string): IModel {
    if (model instanceof Model) {
      model.__collection = this;
      return model;
    } else {
      const TypeModel: IModelConstructor = this.__getModel(type);
      return new TypeModel(model, this);
    }
  }

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
  add<T extends IModel>(model: Array<IModel>): Array<T>;
  add<T extends IModel>(model: IModel): T;
  add<T extends IModel>(model: Array<Object>, type?: string): Array<T>;
  add<T extends IModel>(model: Object, type?: string): T;
  @action add(model: any, type?: string) {
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
   * @argument {string} type - Type of the model that will be searched for
   * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be returned)
   * @returns {T} Found model
   *
   * @memberOf Collection
   */
  find<T extends IModel>(type: string, id?: string|number): T {
    const modelList: Array<T> = id
      ? this.__data.filter((item) => matchModel(item, type, id)) as Array<T>
      : this.findAll<T>(type);

    return first(modelList) || null;
  }

  /**
   * Find all models of the specified type
   *
   * @template T
   * @argument {string} type - Type of the models that will be searched for
   * @returns {Array<T>} Found models
   *
   * @memberOf Collection
   */
  findAll<T extends IModel>(type: string): Array<T> {
    const item = first(this.__data);
    return this.__data.filter((item) => getType(item) === type) as Array<T>;
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
  remove<T extends IModel>(type: string, id?: string|number): T {
    const model = this.find<T>(type, id);
    this.__removeModels([model]);
    return model;
  }

  /**
   * Remove all models of the specified type from the collection
   *
   * @template T
   * @argument {string} type - Type of the models that will be removed
   * @returns {Array<T>} Removed models
   *
   * @memberOf Collection
   */
  @action removeAll<T extends IModel>(type: string): Array<T> {
    const models = this.findAll<T>(type);
    this.__removeModels(models);
    return models;
  }

  /**
   * Reset the collection - remove all models
   *
   * @memberOf Collection
   */
  @action reset(): void {
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
  toJS(): Array<IDictionary> {
    return this.__data.map((item) => item.toJS());
  }
}
