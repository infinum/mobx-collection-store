import { IObservableObject } from 'mobx';
import IReferences from './interfaces/IReferences';
import IModel from './interfaces/IModel';
import ICollection from './interfaces/ICollection';
declare class Model implements IModel {
    /** Identifier of the model */
    id: string | number;
    /** Collection the model belongs to */
    collection?: ICollection;
    /** The attribute that should be used as the unique identifier */
    static idAttribute: string;
    /** The references that the model can have to other models */
    static refs: IReferences;
    /** Type of the model */
    static type: string;
    /** Internal data storage */
    private data;
    /** Model attributes */
    attrs: IObservableObject;
    /** Model references */
    refs: IObservableObject;
    constructor(initialData: Object, collection?: ICollection);
    /**
     * Initialize the reference getters based on the static refs property
     *
     * @returns {undefined}
     */
    private __initRefGetters();
    /**
     * Getter for the computed referenced model
     *
     * @argument {string} ref - Reference name
     * @returns {IComputedValue<IModel>} Getter function
     */
    private __getRef(ref);
    /**
     * Getter for the computed property value
     *
     * @argument {string} key - Property name
     * @returns {IComputedValue<IModel>} Getter function
     */
    private __getProp(key);
    /**
     * Setter for the referenced model
     * If the value is an object it will be upserted into the collection
     *
     * @argument {string} ref - Reference name
     * @argument {IModel|Object|string|number} val - The referenced mode
     * @returns {IModel} Referenced model
     */
    private __setRef(ref, val);
    /** Static model class */
    private readonly static;
    /** Model type */
    readonly type: string;
    /**
     * Update the existing model
     *
     * @augments {IModel|Object} data - The new model
     * @returns {Object} Values that have been updated
     */
    update(data: IModel | Object): Object;
    /**
     * Set a specific model property
     *
     * @argument {string} key - Property to be set
     * @argument {any} value - Value to be set
     * @returns {any} The set value (Can be an IModel if the value vas a reference)
     */
    set(key: string, value: any): any;
    /**
     * Convert the model into a plain JS Object in order to be serialized
     *
     * @returns {Object} Plain JS Object representing the model
     */
    toJS(): Object;
}
export { Model };
