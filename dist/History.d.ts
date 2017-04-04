import { IObservableArray } from 'mobx';
import IChange from './interfaces/IChange';
export declare class History {
    /**
     * History stack
     *
     * @protected
     * @type {IObservableArray<IChange>}
     * @memberOf Model
     */
    protected __history: IObservableArray<IChange>;
    /**
     * Current position in the history stack
     *
     * @protected
     * @type {number}
     * @memberOf Model
     */
    protected __historyPointer: number;
    /**
     * The flag that determines if the current change should be saved to history
     *
     * @protected
     * @type {boolean}
     * @memberOf Model
     */
    protected __historyIgnore: boolean;
    protected __actionListeners: IObservableArray<(IChange) => any>;
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
}
