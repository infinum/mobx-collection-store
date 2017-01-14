import {extendObservable, observable, computed, IComputedValue, IObservableArray, action} from 'mobx';

import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import ICollection from './interfaces/ICollection';
import {Model} from './Model';
import {TYPE_PROP} from './consts';

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
  private data: IObservableArray<IModel> = observable([])

  /**
   * Creates an instance of Collection.
   *
   * @param {Array<Object>} [data=[]]
   *
   * @memberOf Collection
   */
  constructor(data: Array<Object> = []) {
    this.data.push(...data.map(this.__initItem, this));

    const computedProps = {};
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
    return computed(() => this.data.filter((item) => item.static.type === type));
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
    return this.static.types.filter((item) => item.type === type)[0] || Model;
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
  private __initItem(item): IModel {
    const type = item[TYPE_PROP];
    const TypeModel: IModelConstructor = this.__getModel(type);
    return new TypeModel(item, this);
  }

  /**
   * Static model class
   *
   * @readonly
   * @private
   * @type {typeof Collection}
   * @memberOf Collection
   */
  private get static(): typeof Collection {
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
    return this.data.length;
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
      const modelInstance = model;
      modelInstance.__collection = this;
      return modelInstance;
    } else {
      const TypeModel: IModelConstructor = this.__getModel(type);
      return new TypeModel(model, this);
    }
  }

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
  @action add(model: any, type?: string) {
    if (model instanceof Array) {
      return model.map((item) => this.add(item, type));
    }

    const instance: IModel = this.__getModelInstance(model, type);

    const existing = this.find(instance.static.type, instance[instance.static.idAttribute]);
    if (existing) {
      existing.update(model);
      return existing;
    }

    this.data.push(instance);
    return instance;
  }

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
  private __matchModel(item: IModel, type: string, id: string|number) {
    return item.static.type === type && item[item.static.idAttribute] === id;
  }

  /**
   * Find a specific model
   *
   * @argument {string} type - Type of the model that will be searched for
   * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be returned)
   * @returns {IModel} Found model
   *
   * @memberOf Collection
   */
  find(type: string, id?: string|number): IModel {
    const modelList: Array<IModel> = id
      ? this.data.filter((item) => this.__matchModel(item, type, id))
      : this.findAll(type);

    return modelList[0] || null;
  }

  /**
   * Find all models of the specified type
   *
   * @argument {string} type - Type of the models that will be searched for
   * @returns {Array<IModel>} Found models
   *
   * @memberOf Collection
   */
  findAll(type: string): Array<IModel> {
    return this.data.filter((item) => item.static.type === type);
  }

  /**
   * Remove a specific model from the collection
   *
   * @argument {string} type - Type of the model that will be removed
   * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be removed)
   * @returns {IModel} Removed model
   *
   * @memberOf Collection
   */
  remove(type: string, id?: string|number): IModel {
    const model = this.find(type, id);
    this.data.remove(model);
    return model;
  }

  /**
   * Remove all models of the specified type from the collection
   *
   * @argument {string} type - Type of the models that will be removed
   * @returns {Array<IModel>} Removed models
   *
   * @memberOf Collection
   */
  @action removeAll(type: string): Array<IModel> {
    const models = this.findAll(type);
    models.forEach((model) => {
      this.data.remove(model);
    });
    return models;
  }

  /**
   * Convert the collection (and containing models) into a plain JS Object in order to be serialized
   *
   * @returns {Array<Object>} Plain JS Object Array representing the collection and all its models
   *
   * @memberOf Collection
   */
  toJS(): Array<Object> {
    return this.data.map((item) => item.toJS());
  }
};
