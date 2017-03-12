import IModel from './interfaces/IModel';
export declare class History {
    /**
     * History stack
     *
     * @private
     * @type {IObservableArray<IChange>}
     * @memberOf Model
     */
    private __history;
    /**
     * Current position in the history stack
     *
     * @private
     * @type {number}
     * @memberOf Model
     */
    private __historyPointer;
    /**
     * The flag that determines if the current change should be saved to history
     *
     * @private
     * @type {boolean}
     * @memberOf Model
     */
    private __historyIgnore;
    private __actionListeners;
    /**
     * Undo the last model change
     *
     * @memberOf Model
     */
    undo(): void;
    /**
     * Redo the last model change
     *
     * @memberOf Model
     */
    redo(): void;
    onAction(callback: (IChange) => any): () => void;
    /**
     * Execute a change on the model without triggering history
     *
     * @protected
     * @param {any} key Property to change
     * @param {any} value New value
     *
     * @memberOf Model
     */
    protected __executeChange(key: any, value: any): void;
    /**
     * Save the change to the history stack
     *
     * @protected
     * @param {string} key Changed property
     * @param {*} oldValue Old property value
     * @param {*} newValue New property value
     *
     * @memberOf Model
     */
    protected __addStep(model: IModel, key: string, oldValue: any, newValue: any): void;
}
