import {extendObservable} from 'mobx';

import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import ICollection from './interfaces/ICollection';
import Model from './model';
import {TYPE} from './consts';

class Collection implements ICollection {
  types: Array<IModelConstructor> = []
  private data: Array<IModel> = []

  private getModel(type : string) {
    return this.types.find((item) => item.type === type);
  }

  private initItem(item) {
    const type = item[TYPE];
    const TypeModel = this.getModel(type);
    return new TypeModel(item);
  }

  constructor(data: Array<Object>) {
    this.data.push(...data.map(this.initItem));

    const computedProps = {};
    for (const model of this.types) {
      computedProps[model.type] = () => this.data.filter((item) => item.type === model.type);
    }

    extendObservable(this, computedProps);
  }

  add(model: Object, type: string): IModel;
  add(model: IModel): IModel;
  add(model: any, type?: string) {
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

  find(type: string, id: string | number): IModel {
    return this.data.find((item) => item.type === type && item.id === id);
  }

  toJS(): Array<Object> {
    return this.data.map((item) => item.toJS());
  }
};

export default Collection;
