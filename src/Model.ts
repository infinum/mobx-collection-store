import {observable, extendObservable, toJS, transaction, computed, IComputedValue, IObservableObject} from 'mobx';

import IReferences from './interfaces/IReferences';
import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import ICollection from './interfaces/ICollection';
import {TYPE_PROP, DEFAULT_TYPE} from './consts';

class Model implements IModel {

  /** Identifier of the model */
  id: string | number

  /** Collection the model belongs to */
  collection?: ICollection = null

  /** The attribute that should be used as the unique identifier */
  static idAttribute: string = 'id'

  /** The references that the model can have to other models */
  static refs: IReferences = {}

  /** Type of the model */
  static type: string = DEFAULT_TYPE

  /** Internal data storage */
  private data: IObservableObject = observable({})

  /** Model attributes */
  attrs: IObservableObject = observable({})

  /** Model references */
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

  /**
   * Initialize the reference getters based on the static refs property
   *
   * @returns {undefined}
   */
  private __initRefGetters() {
    const refGetters = {};
    const refKeys: Array<string> = Object.keys(this.static.refs);
    for (const ref of refKeys) {
      refGetters[ref] = this.__getRef(ref);
    }
    extendObservable(this.refs, refGetters);
  }

  /**
   * Getter for the computed referenced model
   *
   * @argument {string} ref - Reference name
   * @returns {IComputedValue<IModel>} Getter function
   */
  private __getRef(ref: string): IComputedValue<IModel> {
    return computed(() => this.collection.find(this.static.refs[ref], this.data[ref]));
  }

  /**
   * Getter for the computed property value
   *
   * @argument {string} key - Property name
   * @returns {IComputedValue<IModel>} Getter function
   */
  private __getProp(key: string): IComputedValue<IModel> {
    return computed(() => this.data[key]);
  }

  /**
   * Setter for the referenced model
   * If the value is an object it will be upserted into the collection
   *
   * @argument {string} ref - Reference name
   * @argument {IModel|Object|string|number} val - The referenced mode
   * @returns {IModel} Referenced model
   */
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

  /** Static model class */
  private get static(): typeof Model {
    return <typeof Model>this.constructor;
  }

  /** Model type */
  get type(): string {
    return this.static.type;
  }

  /**
   * Update the existing model
   *
   * @augments {IModel|Object} data - The new model
   * @returns {Object} Values that have been updated
   */
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

  /**
   * Set a specific model property
   *
   * @argument {string} key - Property to be set
   * @argument {any} value - Value to be set
   * @returns {any} The set value (Can be an IModel if the value vas a reference)
   */
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

  /**
   * Convert the model into a plain JS Object in roder to be serialized
   *
   * @returns {Object} Plain JS Object representing the model
   */
  toJS(): Object {
    const data = toJS(this.data);
    data[TYPE_PROP] = this.type;
    return data;
  }
};

export {Model};
