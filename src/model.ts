import {observable, extendObservable, toJS, transaction, computed, IComputedValue, IObservableObject} from 'mobx';

import IReferences from './interfaces/IReferences';
import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import ICollection from './interfaces/ICollection';
import {TYPE_PROP, DEFAULT_TYPE} from './consts';

class Model implements IModel {
  id: string | number
  collection?: ICollection = null
  static idAttribute: string = 'id'
  static refs: IReferences = {}
  static type: string = DEFAULT_TYPE
  private data: IObservableObject = observable({})
  attrs: IObservableObject = observable({})
  refs: IObservableObject = observable({})

  constructor(initialData: Object, collection?: ICollection) {
    transaction(() => {

      // No need for them to be observable
      this.id = initialData[this.static.idAttribute];
      this.collection = collection;

      this.update(initialData);
      this.__initRefGetters();
    });
  }

  private __initRefGetters() {
    const refGetters = {};
    const refKeys: Array<string> = Object.keys(this.static.refs);
    for (const ref of refKeys) {
      refGetters[ref] = this.__getRef(ref);
    }
    extendObservable(this.refs, refGetters);
  }

  private __getRef(ref: string): IComputedValue<IModel> {
    return computed(() => this.collection.find(this.static.refs[ref], this.data[ref]));
  }

  private __getProp(key: string): IComputedValue<IModel> {
    return computed(() => this.data[key]);
  }

  private __setRef(ref: string, val: IModel | string | number | Object): IModel {
    return transaction(() => {
      if (val instanceof Model) {
        // Make sure we have the same model in the collection
        const model = this.collection.add(val);
        this.data[ref] = model.id;
      } else if (typeof val === 'object') {
        // Add the object to collection if it's not a model yet
        const type = this.static.refs[ref];
        const model = this.collection.add(val, type);
        this.data[ref] = model.id;
      } else {
        // Add a reference to the existing model
        this.data[ref] = val;
      }

      // Find the referenced model in collection
      return this.collection.find(this.static.refs[ref], this.data[ref]);
    });
  }

  private get static(): typeof Model {
    return <typeof Model>this.constructor;
  }

  get type(): string {
    return this.static.type;
  }

  update(data: IModel | Object): Object {
    const vals = {};
    const dataObj = data instanceof Model ? data.attrs : data;
    const keys = Object.keys(dataObj);
    const idAttribute = this.static.idAttribute;

    transaction(() => {
      keys.forEach((key) => {
        if (key !== idAttribute || !this.data[idAttribute]) {
          vals[key] = this.set(key, data[key]);
        }
      });
    });

    return vals;
  }

  set(key: string, value: any): any {
    let val = value;
    if (key in this.static.refs) {
      val = this.__setRef(key, value);
    } else {
      this.data[key] = value;
    }

    // Add getter if it doesn't exist yet
    if (!(key in this.attrs)) {
      extendObservable(this.attrs, {
        [key]: this.__getProp(key)
      });
    }
    return val;
  }

  toJS(): Object {
    const data = toJS(this.data);
    data[TYPE_PROP] = this.type;
    return data;
  }
};

export {Model};
