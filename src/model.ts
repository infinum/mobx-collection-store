import {observable, extendObservable, toJS, transaction, computed, IComputedValue, IObservableObject} from 'mobx';

import IReferences from './interfaces/IReferences';
import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import ICollection from './interfaces/ICollection';
import {TYPE} from './consts';

export abstract class Model implements IModel {
  id: string | number
  idAttribute: string = 'id'
  collection?: ICollection = null
  static refs: IReferences = {}
  private data: IObservableObject = observable({})
  static type: string

  constructor(initialData: Object) {
    this.data = observable(initialData);
    this.id = initialData[this.idAttribute];

    const keys: Array<string> = Object.keys(initialData);

    const computedProps = {};
    for (const key of keys) {
      computedProps[key] = this.getProp(key);
    }

    const refKeys: Array<string> = Object.keys(this.refs);
    for (const ref of refKeys) {
      computedProps[ref] = this.getRef(ref);
      computedProps[`${ref}Id`] = this.getProp(ref)
    }

    extendObservable(this, computedProps);
  }

  private getRef(ref: string): IComputedValue<IModel> {
    return computed(() => this.collection.find(this.refs[ref], this.data[ref]));
  }

  private getProp(key: string): IComputedValue<IModel> {
    return computed(() => this.data[key]);
  }

  private setRef(ref: string, val: IModel | string | number | Object): IModel {
    return transaction(() => {
      if (typeof val === 'object' && !(val instanceof Model)) {
        // Add the object to collection if it's not a model yet
        const type = this.refs[ref];
        const model = this.collection.add(val, type);
        this.data[ref] = model.id;
      } else {
        // Add a reference to the existing model
        this.data[ref] = val instanceof Model ? val.id : val;
      }

      // Find the referenced model in collection
      let innerModel = this.collection.find(this.refs[ref], this.data[ref]);
      if (val instanceof Model && !innerModel) {
        // If we have a model, and it isn't in the collection yet, add it
        this.collection.add(val);
        innerModel = val;
      }
      return innerModel;
    });
  }

  @computed get type(): string {
    return (<typeof Model>this.constructor).type;
  }

  @computed get refs(): IReferences {
    return (<typeof Model>this.constructor).refs;
  }

  set(key: string, value: any): any {
    let val = value;

    transaction(() => {
      if (key in this.refs) {
        val = this.setRef(key, value);
      } else {
        this.data[key] = value;
      }

      // Add getters if they don't exist yet
      if (!(key in this.data)) {
        if (key in this.refs) {
          extendObservable(this, {
            [key]: this.getRef(key),
            [`${key}Id`]: this.getProp(key)
          });
        } else {
          extendObservable(this, {
            [key]: this.getProp(key)
          });
        }
      }
    });

    return val;
  }

  toJS(): Object {
    const data = toJS(this.data);
    data[TYPE] = this.type;
    return data;
  }
};
