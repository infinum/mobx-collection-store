import {observable, extendObservable, toJS, transaction, computed, IComputedValue, IObservableObject} from 'mobx';

import IReferences from './interfaces/IReferences';
import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import ICollection from './interfaces/ICollection';
import {TYPE} from './consts';

abstract class Model implements IModel {
  id: string | number
  collection?: ICollection = null
  static idAttribute: string = 'id'
  static refs: IReferences = {}
  static type: string
  private data: IObservableObject = observable({})
  attrs: IObservableObject = observable({})
  refs: IObservableObject = observable({})

  constructor(initialData: Object, collection?: ICollection) {
    transaction(() => {

      // No need for them to be observable
      this.id = initialData[this.idAttribute];
      this.collection = collection;

      this.update(initialData);
      this.initRefGetters();
    });
  }

  private initRefGetters() {
    const refGetters = {};
    const refKeys: Array<string> = Object.keys(this.refDefs);
    for (const ref of refKeys) {
      refGetters[ref] = this.getRef(ref);
    }
    extendObservable(this.refs, refGetters);
  }

  private getRef(ref: string): IComputedValue<IModel> {
    return computed(() => this.collection.find(this.refDefs[ref], this.data[ref]));
  }

  private getProp(key: string): IComputedValue<IModel> {
    return computed(() => this.data[key]);
  }

  private setRef(ref: string, val: IModel | string | number | Object): IModel {
    return transaction(() => {
      if (val instanceof Model) {
        // Make sure we have the same model in the collection
        const model = this.collection.add(val);
        this.data[ref] = model.id;
      } else if (typeof val === 'object') {
        // Add the object to collection if it's not a model yet
        const type = this.refDefs[ref];
        const model = this.collection.add(val, type);
        this.data[ref] = model.id;
      } else {
        // Add a reference to the existing model
        this.data[ref] = val;
      }

      // Find the referenced model in collection
      return this.collection.find(this.refDefs[ref], this.data[ref]);
    });
  }

  private get static(): typeof Model {
    return <typeof Model>this.constructor;
  }

  @computed get idAttribute(): string {
    return this.static.idAttribute;
  }

  @computed get type(): string {
    return this.static.type;
  }

  @computed get refDefs(): IReferences {
    return this.static.refs;
  }

  @computed get keys(): Array<string> {
    return Object.keys(this.data);
  }

  update(data: IModel | Object): Object {
    const vals = {};
    const keys = data instanceof Model ? data.keys : Object.keys(data);

    transaction(() => {
      keys.forEach((key) => {
        if (key !== this.idAttribute || !this.data[this.idAttribute]) {
          vals[key] = this.set(key, data[key]);
        }
      });
    });

    return vals;
  }

  set(key: string, value: any): any {
    let val = value;
    if (key in this.refDefs) {
      val = this.setRef(key, value);
    } else {
      this.data[key] = value;
    }

    // Add getter if it doesn't exist yet
    if (!(key in this.attrs)) {
      extendObservable(this.attrs, {
        [key]: this.getProp(key)
      });
    }
    return val;
  }

  toJS(): Object {
    const data = toJS(this.data);
    data[TYPE] = this.type;
    return data;
  }
};

export {Model};
