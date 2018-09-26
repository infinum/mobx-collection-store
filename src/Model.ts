import {
  action, computed, extendObservable,
  IArrayChange, IArraySplice, IComputedValue,
  intercept, IObservableArray, IObservableObject,
  isObservableArray, observable, toJS,
} from 'mobx';

import patchType from './enums/patchType';
import ICollection from './interfaces/ICollection';
import IDictionary from './interfaces/IDictionary';
import IExternalRef from './interfaces/IExternalRef';
import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import IOpts from './interfaces/IOpts';
import IPatch from './interfaces/IPatch';
import IReferences from './interfaces/IReferences';
import IType from './interfaces/IType';

import {Collection} from './Collection';
import {DEFAULT_TYPE, RESERVED_KEYS, TYPE_PROP} from './consts';
import {assign, first, getProp, getType, mapItems, setProp} from './utils';

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
   * @type {string|Array<string>}
   * @memberOf Model
   */
  public static idAttribute: string|Array<string> = 'id';

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
   * @type {IType}
   * @memberOf Model
   */
  public static type: IType = DEFAULT_TYPE;

  /**
   * Atribute name for the type attribute
   *
   * @static
   * @type {string|Array<string>}
   * @memberOf Model
   */
  public static typeAttribute: string|Array<string> = TYPE_PROP;

  /**
   * Defines if the model should use autoincrement id if none is defined
   *
   * @static
   * @type {boolean}
   * @memberOf Model
   */
  public static enableAutoId: boolean = true;

  /**
   * Autoincrement counter used for the builtin function
   *
   * @public
   * @static
   *
   * @memberOf Model
   */
  public static autoincrementValue = 1;

  /**
   * Function that can process the received data (e.g. from an API) before
   * it's transformed into a model
   *
   * @static
   * @param {object} [rawData={}] - Raw data
   * @returns {object} Transformed data
   *
   * @memberOf Model
   */
  public static preprocess(rawData: object = {}): object {
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
  private __refs: {[key: string]: number|string} = {};

  /**
   * Internal data storage
   *
   * @private
   * @type {IObservableObject}
   * @memberOf Model
   */
  private __data: IObservableObject = observable({});

  /**
   * A list of all registered patch listeners
   *
   * @private
   * @memberof Model
   */
  private __patchListeners: Array<(change: IPatch, model: IModel) => void> = [];

  /**
   * Determines if the patch listeners should be called on change
   *
   * @private
   * @type {boolean}
   * @memberof Model
   */
  private __silent: boolean = true;

  /**
   * Creates an instance of Model.
   *
   * @param {Object} initialData
   * @param {Collection} [collection]
   *
   * @memberOf Model
   */
  constructor(initialData?: object, opts?: IOpts, collection?: Collection);
  constructor(initialData?: object, collection?: Collection);
  constructor(initialData: object = {}, opts?: IOpts|Collection, collection?: Collection) {
    const data = assign({}, this.static.defaults, this.static.preprocess(initialData));

    let collectionInstance = collection;
    const idAttribute = this.static.idAttribute;
    let idSet = false;

    if (opts instanceof Collection) {
      collectionInstance = opts;
    } else if (typeof opts === 'string' || typeof opts === 'number') {
      setProp(data, this.static.typeAttribute, opts);
    } else if (opts && typeof opts === 'object') {
      if (opts.type) {
        setProp(data, this.static.typeAttribute, opts.type);
      }
      if (opts.id || opts.id === 0) {
        setProp(data, idAttribute, opts.id);
        idSet = true;
      }
    }

    if (!idSet) {
      this.__ensureId(data, collectionInstance);
      setProp({}, idAttribute, getProp<string|number>(data, idAttribute));
    }

    // No need for it to be observable
    this.__collection = collectionInstance;

    this.__initRefGetters();
    this.update(data);
    this.__silent = false;
  }

  /**
   * Static model class
   *
   * @readonly
   * @type {typeof Model}
   * @memberOf Model
   */
  get static(): typeof Model {
    return this.constructor as typeof Model;
  }

  /**
   * Update the existing model
   *
   * @augments {IModel|object} data - The new model
   * @returns {object} Values that have been updated
   *
   * @memberOf Model
   */
  @action public update(data: IModel | object): object {
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
   * @returns {T|IModel} The assigned value (Can be an IModel)
   *
   * @memberOf Model
   */
  @action public assign<T>(key: string, value: T): T|IModel|Array<IModel> {
    let val: T|IModel|Array<IModel> = value;
    const isRef: boolean = key in this.__refs;
    if (isRef) {
      val = this.__setRef(key, value);
    } else {
      const patchAction = key in this.__data ? patchType.REPLACE : patchType.ADD;
      const oldValue = this.__data[key];
      // TODO: Could be optimised based on __initializedProps?
      extendObservable(this.__data, {[key]: value});

      this.__triggerChange(patchAction, key, value, oldValue);
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
   * @param {IType} [type] - reference type
   * @returns {(T|IModel|Array<IModel>)} - referenced model(s)
   *
   * @memberOf Model
   */
  @action public assignRef<T>(key: string, value: T, type?: IType): T|IModel|Array<IModel> {

    /* istanbul ignore next */
    if (typeof this.static.refs[key] === 'object') {
      throw new Error(key + ' is an external reference');
    }

    if (key in this.__refs) { // Is already a reference
      return this.assign<T>(key, value);
    }

    const item = value instanceof Array ? first(value) : value;
    this.__refs[key] = item instanceof Model ? getType(item) : type;
    const data = this.__setRef(key, value);
    this.__initRefGetter(key, this.__refs[key]);
    this.__triggerChange(patchType.ADD, key, data);
    return data;
  }

  /**
   * Unassign a property from the model
   *
   * @param {string} key A property to unassign
   * @memberof Model
   */
  @action public unassign(key: string): void {
    const oldValue = this.__data[key];
    delete this.__data[key];
    this.__triggerChange(patchType.REMOVE, key, undefined, oldValue);
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
   * Exposed snapshot state of the model
   *
   * @readonly
   * @memberof Model
   */
  @computed public get snapshot() {
    return this.toJS();
  }

  /**
   * Add a listener for patches
   *
   * @param {(data: IPatch) => void} listener A new listener
   * @returns {() => void} Function used to remove the listener
   * @memberof Model
   */
  public patchListen(listener: (data: IPatch, model: IModel) => void): () => void {
    this.__patchListeners.push(listener);

    return () => {
      this.__patchListeners = this.__patchListeners.filter((item) => item !== listener);
    };
  }

  /**
   * Apply an existing JSONPatch on the model
   *
   * @param {IPatch} patch The patch object
   * @memberof Model
   */
  public applyPatch(patch: IPatch): void {
    const field = patch.path.slice(1);

    /* istanbul ignore else */
    if (patch.op === patchType.ADD || patch.op === patchType.REPLACE) {
      this.assign(field, patch.value);
    } else if (patch.op === patchType.REMOVE) {
      this.unassign(field);
    }
  }

  public getRecordId(): number|string {
    return getProp<number|string>(this, this.static.idAttribute);
  }

  public getRecordType(): IType {
    return getProp<IType>(this, this.static.typeAttribute) || this.static.type;
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
    const id = getProp<string|number>(data, idAttribute);
    if (!id) {
      if (!this.static.enableAutoId) {
        throw new Error(`${idAttribute} is required!`);
      } else {
        let newId;
        do {
          newId = this.static.autoIdFunction();
          const idProp = setProp(data, idAttribute, newId);
        } while (collection && collection.find(getType(this), newId));
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
  private __initRefGetter(ref: string, type?: IType) {
    const staticRef = this.static.refs[ref];
    if (typeof staticRef === 'object') {
      extendObservable(this, {
        [ref]: this.__getExternalRef(staticRef),
      });
    } else {
      this.__initializedProps.push(ref, `${ref}Id`);
      this.__refs[ref] = type || staticRef;

      // Make sure the reference is observable, even if there is no default data
      if (!(ref in this.__data)) {
        extendObservable(this.__data, {[ref]: null});
      }

      extendObservable(this, {
        [ref]: this.__getRef(ref),
        [`${ref}Id`]: this.__getProp(ref),
      });
    }
  }

  /**
   * An calculated external reference getter
   *
   * @private
   * @param {IExternalRef} ref - Reference definition
   * @returns {(IComputedValue<IModel|Array<IModel>>)}
   *
   * @memberof Model
   */
  private __getExternalRef(ref: IExternalRef): IComputedValue<IModel|Array<IModel>> {
    return computed(() => {
      return !this.__collection ? [] : this.__collection.findAll(ref.model)
        .filter((model: IModel) => {
          const prop = model[ref.property];
          if (prop instanceof Array || isObservableArray(prop)) {
            return prop.indexOf(this) !== -1;
          } else {
            return prop === this;
          }
        });
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
   * @param {IType} type - type of the reference
   * @param {T} item - model reference
   * @returns {number|string}
   *
   * @memberOf Model
   */
  private __getValueRefs(type: IType, item: IModel | object): number|string {

    /* istanbul ignore next */
    if (!item) { // Handle case when the ref is unsetted
      return null;
    }

    if (typeof item === 'object') {
      const model = this.__collection.add(item, type);
      if (getType(model) !== type) {
        throw new Error(`The model should be a '${type}'`);
      }
      return getProp<string|number>(model, model.static.idAttribute);
    }
    return item;
  }

  /**
   * Update the referenced array on push/pull/update
   *
   * @private
   * @param {IType} ref - reference name
   * @param {any} change - MobX change object
   * @returns {null} no direct change
   *
   * @memberOf Model
   */
  @action private __partialRefUpdate(ref: IType, change: IChange): IChange {
    const type = this.__refs[ref];

    /* istanbul ignore else */
    if (change.type === 'splice') {
      const added = change.added.map(this.__getValueRefs.bind(this, type));
      this.__data[ref].splice(change.index, change.removedCount, ...added);
      return null;
    } else if (change.type === 'update') {
      const newValue = this.__getValueRefs(type, change.newValue);
      this.__data[ref][change.index] = newValue;
      return null;
    }

    /* istanbul ignore next */
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
    const dataModels = mapItems<IModel>(this.__data[key], (refId: string) => {
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
    const isArray = val instanceof Array || isObservableArray(val);
    const hasModelInstances = isArray
      ? (val as Array<T>).some((item) => item instanceof Model)
      : val instanceof Model;

    if (!this.__collection && hasModelInstances) {
      throw new Error('Model needs to be in a collection to set a reference');
    }
    // @ts-ignore
    const data: object|Array<object>|null = val;
    const type = this.__refs[ref];
    const refs = mapItems<number|string>(data, this.__getValueRefs.bind(this, type));

    const getRef = () => this.__collection ? (this.__getReferencedModels(ref) || undefined) : undefined;

    const oldValue = getRef();
    const patchAction = oldValue === undefined ? patchType.ADD : patchType.REPLACE;

    // TODO: Could be optimised based on __initializedProps?
    extendObservable(this.__data, {[ref]: refs});

    const newValue = getRef();
    this.__triggerChange(newValue === undefined ? patchType.REMOVE : patchAction, ref, newValue, oldValue);

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
    if (key !== idAttribute || !getProp<string|number>(this.__data, idAttribute)) {
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

  /**
   * Function that creates a patch object and calls all listeners
   *
   * @private
   * @param {patchType} type Action type
   * @param {string} field Field where the action was made
   * @param {*} [value] The new value (if it applies)
   * @memberof Model
   */
  private __triggerChange(type: patchType, field: string, value?: any, oldValue?: any): void {
    if (this.__silent) {
      return;
    }

    if (type === patchType.REPLACE && value === oldValue) {
      return;
    }

    const patchObj: IPatch = {
      oldValue,
      op: type,
      path: `/${field}`,
      value,
    };

    this.__patchListeners.forEach((listener) => typeof listener === 'function' && listener(patchObj, this));

    if (this.__collection) {
      // tslint:disable-next-line:no-string-literal
      this.__collection['__onPatchTrigger'](patchObj, this);
    }
  }
}
