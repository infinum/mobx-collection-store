import {
  action, computed, extendObservable,
  IArrayChange, IArraySplice, IComputedValue,
  intercept, IObservableArray, IObservableObject, observable, toJS,
} from 'mobx';

import ICollection from './interfaces/ICollection';
import IDictionary from './interfaces/IDictionary';
import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import IReferences from './interfaces/IReferences';

import {DEFAULT_TYPE, RESERVED_KEYS, TYPE_PROP} from './consts';
import {assign, first, getType, mapItems} from './utils';

type IChange = IArraySplice<IModel> | IArrayChange<IModel>;

/**
 * MobX Collection Model class
 *
 * @class Model
 * @implements {IModel}
 */
export class Model implements IModel {

  /**
   * The attribute that should be used as the unique identifier
   *
   * @static
   * @type {string}
   * @memberOf Model
   */
  public static idAttribute: string = 'id';

  /**
   * The references that the model can have to other models
   *
   * @static
   * @type {IReferences}
   * @memberOf Model
   */
  public static refs: IReferences = {};

  /**
   * Default values of model props
   *
   * @static
   * @type {IDictionary}
   * @memberOf Model
   */
  public static defaults: IDictionary = {};

  /**
   * Type of the model
   *
   * @static
   * @type {string}
   * @memberOf Model
   */
  public static type: string = DEFAULT_TYPE;

  /**
   * Atribute name for the type attribute
   *
   * @static
   * @type {string}
   * @memberOf Model
   */
  public static typeAttribute: string = TYPE_PROP;

  /**
   * Defines if the model should use autoincrement id if none is defined
   *
   * @static
   * @type {boolean}
   * @memberOf Model
   */
  public static enableAutoId: boolean = true;

  /**
   * Function that can process the received data (e.g. from an API) before it's transformed into a model
   *
   * @static
   * @param {Object} [rawData={}] - Raw data
   * @returns {Object} Transformed data
   *
   * @memberOf Model
   */
  public static preprocess(rawData: Object = {}): Object {
    return rawData;
  }

  /**
   * Function used for generating the autoincrement IDs
   *
   * @static
   * @returns {number|string} id
   *
   * @memberOf Model
   */
  public static autoIdFunction(): number|string {
    const id = this.autoincrementValue;
    this.autoincrementValue++;
    return id;
  }

  /**
   * Autoincrement counter used for the builtin function
   *
   * @private
   * @static
   *
   * @memberOf Model
   */
  private static autoincrementValue = 1;

  /**
   * Collection the model belongs to
   *
   * @type {ICollection}
   * @memberOf Model
   */
  public __collection?: ICollection = null;

  /**
   * List of properties that were initialized on the model
   *
   * @private
   * @type {Array<string>}
   * @memberOf Model
   */
  private __initializedProps: Array<string> = [];

  /**
   * The model references
   *
   * @static
   * @type {IReferences}
   * @memberOf Model
   */
  private __refs: IReferences = {};

  /**
   * Internal data storage
   *
   * @private
   * @type {IObservableObject}
   * @memberOf Model
   */
  private __data: IObservableObject = observable({});

  /**
   * Creates an instance of Model.
   *
   * @param {Object} initialData
   * @param {ICollection} [collection]
   *
   * @memberOf Model
   */
  constructor(initialData: Object = {}, collection?: ICollection) {
    const data = assign({}, this.static.defaults, this.static.preprocess(initialData));

    this.__ensureId(data, collection);

    // No need for it to be observable
    this.__collection = collection;

    this.__initRefGetters();
    this.update(data);
  }

  /**
   * Static model class
   *
   * @readonly
   * @type {typeof Model}
   * @memberOf Model
   */
  get static(): typeof Model {
    return <typeof Model> this.constructor;
  }

  /**
   * Update the existing model
   *
   * @augments {IModel|Object} data - The new model
   * @returns {Object} Values that have been updated
   *
   * @memberOf Model
   */
  @action public update(data: IModel | Object): Object {
    if (data === this) {
      return this; // Nothing to do - don't update with itself
    }
    const vals = {};

    Object.keys(data).forEach(this.__updateKey.bind(this, vals, data));

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
  @action public assign<T>(key: string, value: T): T|IModel|Array<IModel> {
    let val: T|IModel|Array<IModel> = value;
    const isRef: boolean = key in this.__refs;
    if (isRef) {
      val = this.__setRef(key, value);
    } else {
      // TODO: Could be optimised based on __initializedProps?
      extendObservable(this.__data, {[key]: value});
    }
    this.__ensureGetter(key);
    return val;
  }

  /**
   * Assign a new reference to the model
   *
   * @template T
   * @param {string} key - reference name
   * @param {T} value - reference value
   * @param {string} [type] - reference type
   * @returns {(T|IModel|Array<IModel>)} - referenced model(s)
   *
   * @memberOf Model
   */
  @action public assignRef<T>(key: string, value: T, type?: string): T|IModel|Array<IModel> {
    if (key in this.__refs) { // Is already a reference
      return this.assign<T>(key, value);
    }
    const item = value instanceof Array ? first(value) : value;
    this.__refs[key] = item instanceof Model ? getType(item) : type;
    const data = this.__setRef(key, value);
    this.__initRefGetter(key, this.__refs[key]);
    return data;
  }

  /**
   * Convert the model into a plain JS Object in order to be serialized
   *
   * @returns {IDictionary} Plain JS Object representing the model
   *
   * @memberOf Model
   */
  public toJS(): IDictionary {
    const data: IDictionary = toJS(this.__data);
    data[TYPE_PROP] = getType(this);
    return data;
  }

  /**
   * Ensure the new model has a valid id
   *
   * @private
   * @param {any} data - New model object
   * @param {any} [collection] - Collection the model will belong to
   *
   * @memberOf Model
   */
  private __ensureId(data: IDictionary, collection?: ICollection) {
    const idAttribute = this.static.idAttribute;
    if (!data[idAttribute]) {
      if (!this.static.enableAutoId) {
        throw new Error(`${idAttribute} is required!`);
      } else {
        do {
          data[idAttribute] = this.static.autoIdFunction();
        } while (collection.find(getType(this), data[idAttribute]));
      }
    }

  }

  /**
   * Add new reference getter/setter to the model
   *
   * @private
   * @param {any} ref - reference name
   *
   * @memberOf Model
   */
  private __initRefGetter(ref: string, type?: string) {
    this.__initializedProps.push(ref, `${ref}Id`);
    this.__refs[ref] = type || this.static.refs[ref];

    extendObservable(this, {
      [ref]: this.__getRef(ref),
      [`${ref}Id`]: this.__getProp(ref),
    });
  }

  /**
   * Initialize the reference getters based on the static refs property
   *
   * @private
   *
   * @memberOf Model
   */
  private __initRefGetters(): void {
    const refKeys: Array<string> = Object.keys(this.static.refs);

    for (const ref of refKeys) {
      this.__initRefGetter(ref);
    }
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
      (value) => this.assign(ref, value),
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
      (value) => this.assign(key, value),
    );
  }

  /**
   * Get the reference id
   *
   * @private
   * @template T
   * @param {string} type - type of the reference
   * @param {T} item - model reference
   * @returns {number|string}
   *
   * @memberOf Model
   */
  private __getValueRefs<T>(type: string, item: T): number|string {
    if (!item) { // Handle case when the ref is unsetted
      return null;
    } else if (typeof item === 'object') {
      const model = this.__collection.add(item, type);
      if (getType(model) !== type) {
        throw new Error(`The model should be a '${type}'`);
      }
      return model[model.static.idAttribute];
    }
    return item;
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
  @action private __partialRefUpdate(ref: string, change: IChange): IChange {
    const type = this.__refs[ref];
    if (change.type === 'splice') {
      const added = change.added.map(this.__getValueRefs.bind(this, type));
      this.__data[ref].splice(change.index, change.removedCount, ...added);
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
  private __getReferencedModels(key: string): IModel|Array<IModel> {
    let dataModels = mapItems<IModel>(this.__data[key], (refId: string) => {
      return this.__collection.find(this.__refs[key], refId);
    });

    if (dataModels instanceof Array) {
      const data: IObservableArray<IModel> = observable(dataModels);
      intercept(data, (change: IChange) => this.__partialRefUpdate(key, change));
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
    const type = this.__refs[ref];
    const refs = mapItems<number|string>(val, this.__getValueRefs.bind(this, type));

    // TODO: Could be optimised based on __initializedProps?
    extendObservable(this.__data, {[ref]: refs});

    // Handle the case when the ref is unsetted
    if (!refs) {
      return null;
    }

    // Find the referenced model(s) in collection
    return this.__collection ? this.__getReferencedModels(ref) : null;
  }

  /**
   * Update the model property
   *
   * @private
   * @param {any} vals - An object of all updates
   * @param {any} data - Data used to update
   * @param {any} key - Key to be updated
   * @returns
   *
   * @memberOf Model
   */
  private __updateKey(vals, data, key) {
    const idAttribute = this.static.idAttribute;
    if (RESERVED_KEYS.indexOf(key) !== -1) {
      return; // Skip the key because it would override the internal key
    }
    if (key !== idAttribute || !this.__data[idAttribute]) {
      vals[key] = this.assign(key, data[key]);
    }
  }

  /**
   * Add getter if it doesn't exist yet
   *
   * @private
   * @param {string} key
   *
   * @memberOf Model
   */
  private __ensureGetter(key: string) {
    if (this.__initializedProps.indexOf(key) === -1) {
      this.__initializedProps.push(key);
      extendObservable(this, {[key]: this.__getProp(key)});
    }
  }
}
