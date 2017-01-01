import {extendObservable, observable, computed, IComputedValue, IObservableArray, transaction} from 'mobx';

import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import ICollection from './interfaces/ICollection';
import {Model} from './Model';
import {TYPE_PROP} from './consts';

export class Collection implements ICollection {

  /** List of custom model types */
  static types: Array<IModelConstructor> = []

  /** Internal data storage */
  private data: IObservableArray<IModel> = observable([])

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
   * @argument {string} type - Type of the model
   * @returns {IComputedValue<Array<IModel>>} Getter function
   */
  private __getByType(type: string): IComputedValue<Array<IModel>> {
    return computed(() => this.data.filter((item) => item.type === type));
  }

  /**
   * Get the model constructor for a given model type
   *
   * @argument {string} type - The model type we need the constructor for
   * @returns {IModelConstructor} The matching model constructor
   */
  private __getModel(type : string): IModelConstructor {
    return this.static.types.filter((item) => item.type === type)[0] || Model;
  }

  /**
   * Initialize a model based on an imported Object
   *
   * @argument {Object} item - Imported model POJO
   * @returns {IModel} The new model
   */
  private __initItem(item): IModel {
    const type = item[TYPE_PROP];
    const TypeModel: IModelConstructor = this.__getModel(type);
    return new TypeModel(item, this);
  }

  /** Static model class */
  private get static(): typeof Collection {
    return <typeof Collection>this.constructor;
  }

  /** Number of unique models in the collection */
  @computed get length(): number {
    return this.data.length;
  }

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
  add(model: any, type?: string) {
    if (model instanceof Array) {
      return transaction(() =>  model.map((item) => this.add(item, type)));
    }

    let modelInstance: IModel;
    if (model instanceof Model) {
      modelInstance = model;
      modelInstance.collection = this;
    } else {
      const TypeModel: IModelConstructor = this.__getModel(type);
      modelInstance = new TypeModel(model, this);
    }

    const existing = this.find(modelInstance.type, modelInstance.id);
    if (existing) {
      existing.update(model);
      return existing;
    }

    this.data.push(modelInstance);
    return modelInstance;
  }

  /**
   * Find a specific model
   *
   * @argument {string} type - Type of the model that will be searched for
   * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be returned)
   * @returns {IModel} Found model
   */
  find(type: string, id?: string | number): IModel {
    const modelList: Array<IModel> = id
      ? this.data.filter((item) => item.type === type && item.id === id)
      : this.findAll(type);

    return modelList[0] || null;
  }

  /**
   * Find all models of the specified type
   *
   * @argument {string} type - Type of the models that will be searched for
   * @returns {IModel[]} Found models
   */
  findAll(type: string): Array<IModel> {
    return this.data.filter((item) => item.type === type);
  }

  /**
   * Remove a specific model from the collection
   *
   * @argument {string} type - Type of the model that will be removed
   * @argument {string|number} [id] - ID of the model (if none is defined, the first result will be removed)
   * @returns {IModel} Removed model
   */
  remove(type: string, id?: string | number): IModel {
    const model = this.find(type, id);
    this.data.remove(model);
    return model;
  }

  /**
   * Remove all models of the specified type from the collection
   *
   * @argument {string} type - Type of the models that will be removed
   * @returns {IModel[]} Removed models
   */
  removeAll(type: string): Array<IModel> {
    const models = this.findAll(type);
    transaction(() => {
      models.forEach((model) => {
        this.data.remove(model);
      });
    });
    return models;
  }

  /**
   * Convert the collection (and containing models) into a plain JS Object in order to be serialized
   *
   * @returns {Object} Plain JS Object representing the collection and all its models
   */
  toJS(): Array<Object> {
    return this.data.map((item) => item.toJS());
  }
};
