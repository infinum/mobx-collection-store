import {observable, extendObservable, toJS, action, computed, IComputedValue, IObservableObject} from 'mobx';
const assign = require('object-assign');

import IReferences from './interfaces/IReferences';
import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import ICollection from './interfaces/ICollection';
import IDictionary from './interfaces/IDictionary';
import {TYPE_PROP, DEFAULT_TYPE} from './consts';

const __reservedKeys: Array<string> = [
  'static', 'set', 'update', 'toJS', '__id', '__collection'
];

/**
 * MobX Collection Model class
 *
 * @class Model
 * @implements {IModel}
 */
class Model implements IModel {

  /**
   * Identifier of the model
   *
   * @type {(string | number)}
   * @memberOf Model
   */
  __id: string | number

  /**
   * Collection the model belongs to
   *
   * @type {ICollection}
   * @memberOf Model
   */
  __collection?: ICollection = null

  /**
   * The attribute that should be used as the unique identifier
   *
   * @static
   * @type {string}
   * @memberOf Model
   */
  static idAttribute: string = 'id'

  /**
   * The references that the model can have to other models
   *
   * @static
   * @type {IReferences}
   * @memberOf Model
   */
  static refs: IReferences = {}

  /**
   * Default values of model props
   *
   * @static
   * @type {IDictionary}
   * @memberOf Model
   */
  static defaults: IDictionary = {};

  /**
   * Type of the model
   *
   * @static
   * @type {string}
   * @memberOf Model
   */
  static type: string = DEFAULT_TYPE

  /**
   * Internal data storage
   *
   * @private
   * @type {IObservableObject}
   * @memberOf Model
   */
  private __data: IObservableObject = observable({})

  /**
   * Creates an instance of Model.
   *
   * @param {Object} initialData
   * @param {ICollection} [collection]
   *
   * @memberOf Model
   */
  constructor(initialData: Object, collection?: ICollection) {

    const data = assign({}, this.static.defaults, initialData);

    // No need for them to be observable
    this.__id = data[this.static.idAttribute];
    this.__collection = collection;

    this.update(data);
    this.__initRefGetters();
  }

  /**
   * Initialize the reference getters based on the static refs property
   *
   * @private
   *
   * @memberOf Model
   */
  private __initRefGetters(): void {
    const refGetters = {};
    const refKeys: Array<string> = Object.keys(this.static.refs);
    for (const ref of refKeys) {
      refGetters[ref] = this.__getRef(ref);
    }
    extendObservable(this, refGetters);
  }

  /**
   * Getter for the computed referenced model
   *
   * @private
   * @argument {string} ref - Reference name
   * @returns {IComputedValue<IModel>} Getter function
   *
   * @memberOf Model
   */
  private __getRef(ref: string): IComputedValue<IModel> {
    return computed(() => this.__collection
      ?this.__collection.find(this.static.refs[ref], this.__data[ref])
      : null);
  }

  /**
   * Getter for the computed property value
   *
   * @private
   * @argument {string} key - Property name
   * @returns {IComputedValue<IModel>} Getter function
   *
   * @memberOf Model
   */
  private __getProp(key: string): IComputedValue<IModel> {
    return computed(() => this.__data[key]);
  }

  /**
   * Setter for the referenced model
   * If the value is an object it will be upserted into the collection
   *
   * @private
   * @argument {string} ref - Reference name
   * @argument {IModel|Object|string|number} val - The referenced mode
   * @returns {IModel} Referenced model
   *
   * @memberOf Model
   */
  @action private __setRef(ref: string, val: IModel | string | number | Object): IModel {
    if (val instanceof Model) {
      // Make sure we have the same model in the collection
      const model = this.__collection.add(val);
      this.__data[ref] = model.__id;
    } else if (typeof val === 'object') {
      // Add the object to collection if it's not a model yet
      const type = this.static.refs[ref];
      const model = this.__collection.add(val, type);
      this.__data[ref] = model.__id;
    } else {
      // Add a reference to the existing model
      this.__data[ref] = val;
    }

    // Find the referenced model in collection
    return this.__collection
      ? this.__collection.find(this.static.refs[ref], this.__data[ref])
      : null;
  }

  /**
   * Static model class
   *
   * @readonly
   * @type {typeof Model}
   * @memberOf Model
   */
  get static(): typeof Model {
    return <typeof Model>this.constructor;
  }

  /**
   * Update the existing model
   *
   * @augments {IModel|Object} data - The new model
   * @returns {Object} Values that have been updated
   *
   * @memberOf Model
   */
  @action update(data: IModel | Object): Object {
    const vals = {};
    const keys = Object.keys(data);
    const idAttribute = this.static.idAttribute;

    keys.forEach((key) => {
      if (__reservedKeys.indexOf(key) !== -1) {
        // Skip the key because it would override the internal key
        return;
      }
      if (key !== idAttribute || !this.__data[idAttribute]) {
        vals[key] = this.set(key, data[key]);
      }
    });

    return vals;
  }

  /**
   * Set a specific model property
   *
   * @argument {string} key - Property to be set
   * @argument {T} value - Value to be set
   * @returns {T|IModel} The set value (Can be an IModel if the value vas a reference)
   *
   * @memberOf Model
   */
  set<T>(key: string, value: T): T|IModel {
    let val: T|IModel = value;
    const isRef: boolean = key in this.static.refs;
    if (isRef) {
      val = this.__setRef(key, value);
    } else {
      this.__data[key] = value;
    }

    // Add getter if it doesn't exist yet
    if (!(key in this)) {
      extendObservable(this, {
        [isRef ? `${key}Id` : key]: this.__getProp(key)
      });
    }
    return val;
  }

  /**
   * Convert the model into a plain JS Object in order to be serialized
   *
   * @returns {Object} Plain JS Object representing the model
   *
   * @memberOf Model
   */
  toJS(): Object {
    const data = toJS(this.__data);
    data[TYPE_PROP] = this.static.type;
    return data;
  }
};

export {Model};
