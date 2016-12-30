import {extendObservable, observable, computed, IComputedValue, IObservableArray, transaction} from 'mobx';

import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import ICollection from './interfaces/ICollection';
import {Model} from './Model';
import {TYPE} from './consts';

export class Collection implements ICollection {
  types: Array<IModelConstructor> = []
  private data: IObservableArray<IModel> = observable([])

  constructor(data: Array<Object> = []) {
    this.data.push(...data.map(this.initItem));

    const computedProps = {};
    for (const model of this.types) {
      computedProps[model.type] = this.getByType(model.type);
    }

    extendObservable(this, computedProps);
  }

  private getByType(type: string): IComputedValue<Array<IModel>> {
    return computed(() => this.data.filter((item) => item.type === type));
  }

  private getModel(type : string): IModelConstructor {
    return this.types.find((item) => item.type === type);
  }

  private initItem(item): IModel {
    const type = item[TYPE];
    const TypeModel: IModelConstructor = this.getModel(type);
    return new TypeModel(item);
  }

  @computed get length(): number {
    return this.data.length;
  }

  add(model: Object, type: string): IModel;
  add(model: IModel): IModel;
  add(model: Array<Object>, type: string): Array<IModel>;
  add(model: Array<IModel>): Array<IModel>;
  add(model: any, type?: string) {
    if (model instanceof Array) {
      return transaction(() => {
        return model.map((item) => this.add(item, type));
      });
    }
    let modelInstance: IModel;
    if (type) {
      const TypeModel: IModelConstructor = this.getModel(type);
      modelInstance = new TypeModel(model);
    } else {
      modelInstance = model;
    }
    const existing = this.find(modelInstance.type, modelInstance.id);
    if (existing) {
      return existing;
    }
    this.data.push(modelInstance);
    modelInstance.collection = this;
    return modelInstance;
  }

  find(type: string, id?: string | number) {
    if (id) {
      return this.data.find((item) => item.type === type && item.id === id);
    } else {
      return this.findAll(type)[0];
    }
  }

  findAll(type: string): Array<IModel> {
    return this.data.filter((item) => item.type === type);
  }

  remove(type: string, id?: string | number): IModel {
    const model = this.find(type, id);
    this.data.remove(model);
    return model;
  }

  removeAll(type: string): Array<IModel> {
    const models = this.findAll(type);
    transaction(() => {
      models.forEach((model) => {
        this.data.remove(model);
      })
    });
    return models;
  }

  toJS(): Array<Object> {
    return this.data.map((item) => item.toJS());
  }
};
