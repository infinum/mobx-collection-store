import ICollection from './interfaces/ICollection';
import IDictionary from './interfaces/IDictionary';
import IModel from './interfaces/IModel';
import IPatch from './interfaces/IPatch';
import IReferences from './interfaces/IReferences';
import IType from './interfaces/IType';
/**
 * MobX Collection Model class
 *
 * @class Model
 * @implements {IModel}
 */
export declare class Model implements IModel {
    /**
     * The attribute that should be used as the unique identifier
     *
     * @static
     * @type {string}
     * @memberOf Model
     */
    static idAttribute: string;
    /**
     * The references that the model can have to other models
     *
     * @static
     * @type {IReferences}
     * @memberOf Model
     */
    static refs: IReferences;
    /**
     * Default values of model props
     *
     * @static
     * @type {IDictionary}
     * @memberOf Model
     */
    static defaults: IDictionary;
    /**
     * Type of the model
     *
     * @static
     * @type {IType}
     * @memberOf Model
     */
    static type: IType;
    /**
     * Atribute name for the type attribute
     *
     * @static
     * @type {string}
     * @memberOf Model
     */
    static typeAttribute: string;
    /**
     * Defines if the model should use autoincrement id if none is defined
     *
     * @static
     * @type {boolean}
     * @memberOf Model
     */
    static enableAutoId: boolean;
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
    static preprocess(rawData?: object): object;
    /**
     * Function used for generating the autoincrement IDs
     *
     * @static
     * @returns {number|string} id
     *
     * @memberOf Model
     */
    static autoIdFunction(): number | string;
    /**
     * Autoincrement counter used for the builtin function
     *
     * @private
     * @static
     *
     * @memberOf Model
     */
    private static autoincrementValue;
    /**
     * Collection the model belongs to
     *
     * @type {ICollection}
     * @memberOf Model
     */
    __collection?: ICollection;
    /**
     * List of properties that were initialized on the model
     *
     * @private
     * @type {Array<string>}
     * @memberOf Model
     */
    private __initializedProps;
    /**
     * The model references
     *
     * @static
     * @type {IReferences}
     * @memberOf Model
     */
    private __refs;
    /**
     * Internal data storage
     *
     * @private
     * @type {IObservableObject}
     * @memberOf Model
     */
    private __data;
    /**
     * A list of all registered patch listeners
     *
     * @private
     * @memberof Model
     */
    private __patchListeners;
    /**
     * Determines if the patch listeners should be called on change
     *
     * @private
     * @type {boolean}
     * @memberof Model
     */
    private __silent;
    /**
     * Creates an instance of Model.
     *
     * @param {Object} initialData
     * @param {ICollection} [collection]
     *
     * @memberOf Model
     */
    constructor(initialData?: object, collection?: ICollection, listener?: (data: IPatch, model: IModel) => void);
    /**
     * Static model class
     *
     * @readonly
     * @type {typeof Model}
     * @memberOf Model
     */
    readonly static: typeof Model;
    /**
     * Update the existing model
     *
     * @augments {IModel|object} data - The new model
     * @returns {object} Values that have been updated
     *
     * @memberOf Model
     */
    update(data: IModel | object): object;
    /**
     * Set a specific model property
     *
     * @argument {string} key - Property to be set
     * @argument {T} value - Value to be set
     * @returns {T|IModel} The assigned value (Can be an IModel)
     *
     * @memberOf Model
     */
    assign<T>(key: string, value: T): T | IModel | Array<IModel>;
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
    assignRef<T>(key: string, value: T, type?: IType): T | IModel | Array<IModel>;
    /**
     * Unassign a property from the model
     *
     * @param {string} key A property to unassign
     * @memberof Model
     */
    unassign(key: string): void;
    /**
     * Convert the model into a plain JS Object in order to be serialized
     *
     * @returns {IDictionary} Plain JS Object representing the model
     *
     * @memberOf Model
     */
    toJS(): IDictionary;
    /**
     * Exposed snapshot state of the model
     *
     * @readonly
     * @memberof Model
     */
    readonly snapshot: IDictionary;
    /**
     * Add a listener for patches
     *
     * @param {(data: IPatch) => void} listener A new listener
     * @returns {() => void} Function used to remove the listener
     * @memberof Model
     */
    patchListen(listener: (data: IPatch, model: IModel) => void): () => void;
    /**
     * Apply an existing JSONPatch on the model
     *
     * @param {IPatch} patch The patch object
     * @memberof Model
     */
    applyPatch(patch: IPatch): void;
    /**
     * Ensure the new model has a valid id
     *
     * @private
     * @param {any} data - New model object
     * @param {any} [collection] - Collection the model will belong to
     *
     * @memberOf Model
     */
    private __ensureId(data, collection?);
    /**
     * Add new reference getter/setter to the model
     *
     * @private
     * @param {any} ref - reference name
     *
     * @memberOf Model
     */
    private __initRefGetter(ref, type?);
    /**
     * An calculated external reference getter
     *
     * @private
     * @param {IExternalRef} ref - Reference definition
     * @returns {(IComputedValue<IModel|Array<IModel>>)}
     *
     * @memberof Model
     */
    private __getExternalRef(ref);
    /**
     * Initialize the reference getters based on the static refs property
     *
     * @private
     *
     * @memberOf Model
     */
    private __initRefGetters();
    /**
     * Getter for the computed referenced model
     *
     * @private
     * @argument {string} ref - Reference name
     * @returns {IComputedValue<IModel>} Getter function
     *
     * @memberOf Model
     */
    private __getRef(ref);
    /**
     * Getter for the computed property value
     *
     * @private
     * @argument {string} key - Property name
     * @returns {IComputedValue<IModel>} Getter function
     *
     * @memberOf Model
     */
    private __getProp(key);
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
    private __getValueRefs(type, item);
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
    private __partialRefUpdate(ref, change);
    /**
     * Get the model(s) referenced by a key
     *
     * @private
     * @param {string} key - the reference key
     * @returns {(IModel|Array<IModel>)}
     *
     * @memberOf Model
     */
    private __getReferencedModels(key);
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
    private __setRef<T>(ref, val);
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
    private __updateKey(vals, data, key);
    /**
     * Add getter if it doesn't exist yet
     *
     * @private
     * @param {string} key
     *
     * @memberOf Model
     */
    private __ensureGetter(key);
    /**
     * Function that creates a patch object and calls all listeners
     *
     * @private
     * @param {patchType} type Action type
     * @param {string} field Field where the action was made
     * @param {*} [value] The new value (if it applies)
     * @memberof Model
     */
    private __triggerChange(type, field, value?, oldValue?);
}
