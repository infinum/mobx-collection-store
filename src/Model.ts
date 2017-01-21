import {observable, extendObservable, toJS, action, computed, intercept, IComputedValue, IObservableObject, IObservableArray} from 'mobx';
const assign = require('object-assign');

import IReferences from './interfaces/IReferences';
import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import ICollection from './interfaces/ICollection';
import IDictionary from './interfaces/IDictionary';
import {TYPE_PROP, DEFAULT_TYPE} from './consts';
import {mapItems} from './utils';

const __reservedKeys: Array<string> = [
  'static', 'set', 'update', 'toJS',
  '__id', '__collection',
  '__data', '__getProp', '__initializedProps',
  '__getRef', '__setRef', '__initRefGetters', '__partialRefUpdate'
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
   * List of properties that were initialized on the model
   *
   * @private
   * @type {Array<string>}
   * @memberOf Model
   */
  private __initializedProps: Array<string> = [];

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

    this.__initRefGetters();
    this.update(data);
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
      refGetters[`${ref}Id`] = this.__getProp(ref);
      this.__initializedProps.push(ref, `${ref}Id`);
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
  private __getRef(ref: string): IComputedValue<IModel|Array<IModel>> {
    return computed(
      () => this.__collection ? this.__getReferencedModels(ref) : null,
      (value) => this.assign(ref, value)
    );
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
    return computed(
      () => this.__data[key],
      (value) => this.assign(key, value)
    );
  }

  /**
   * Get the reference id
   *
   * @private
   * @template T
   * @param {string} type - type fo the reference
   * @param {T} item - model reference
   * @returns {number|string}
   *
   * @memberOf Model
   */
  private __getValueRefs<T>(type: string, item: T): number|string {
    if (typeof item === 'object') {
      const model = this.__collection.add(item, type);
      return model.__id;
    } else {
      return item;
    }
  }

  /**
   * Update the referenced array on push/pull/update
   *
   * @private
   * @param {string} ref - reference name
   * @param {any} change - MobX change object
   * @returns {null} no direct change
   *
   * @memberOf Model
   */
  @action private __partialRefUpdate(ref: string, change) {
    const type = this.static.refs[ref];
    if (change.type === 'splice') {
      const added = change.added.map(this.__getValueRefs.bind(this, type));
      this.__data[ref].splice(change.index, change.removeCount, ...added);
      return null;
    } else if (change.type === 'update') {
      const newValue = this.__getValueRefs(type, change.newValue);
      this.__data[ref][change.index] = newValue;
      return null;
    }
    return change;
  }

  /**
   * Get the model(s) referenced by a key
   *
   * @private
   * @param {string} key - the reference key
   * @returns {(IModel|Array<IModel>)}
   *
   * @memberOf Model
   */
  private __getReferencedModels(key: string) : IModel|Array<IModel> {
    let dataModels = mapItems<IModel>(this.__data[key], (refId) => {
      return this.__collection.find(this.static.refs[key], refId);
    });

    if (dataModels instanceof Array) {
      const data: IObservableArray<IModel> = observable(dataModels);
      intercept(data, (change) => this.__partialRefUpdate(key, change));
      return data;
    }

    return dataModels;
  }

  /**
   * Setter for the referenced model
   * If the value is an object it will be upserted into the collection
   *
   * @private
   * @argument {string} ref - Reference name
   * @argument {T} val - The referenced mode
   * @returns {IModel} Referenced model
   *
   * @memberOf Model
   */
  private __setRef<T>(ref: string, val: T|Array<T>): IModel|Array<IModel> {
    const type = this.static.refs[ref];
    const refs = mapItems<number|string>(val, this.__getValueRefs.bind(this, type));

    // TODO: Could be optimised based on __initializedProps?
    extendObservable(this.__data, {[ref]: refs});

    // Find the referenced model(s) in collection
    return this.__collection ? this.__getReferencedModels(ref) : null;
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
    if (data === this) {
      return this; // Nothing to do - don't update with itself
    }
    const vals = {};
    const keys = Object.keys(data);
    const idAttribute = this.static.idAttribute;

    keys.forEach((key) => {
      if (__reservedKeys.indexOf(key) !== -1) {
        return; // Skip the key because it would override the internal key
      }
      if (key !== idAttribute || !this.__data[idAttribute]) {
        vals[key] = this.assign(key, data[key]);
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
  @action assign<T>(key: string, value: T): T|IModel|Array<IModel> {
    let val: T|IModel|Array<IModel> = value;
    const isRef: boolean = key in this.static.refs;
    if (isRef) {
      val = this.__setRef(key, value);
    } else {
      // TODO: Could be optimised based on __initializedProps?
      extendObservable(this.__data, {[key]: value});
    }

    // Add getter if it doesn't exist yet
    if (this.__initializedProps.indexOf(key) === -1) {
      this.__initializedProps.push(key);
      extendObservable(this, {[key]: this.__getProp(key)});
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
