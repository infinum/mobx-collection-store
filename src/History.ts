import {IObservableArray, observable} from 'mobx';

import IChange from './interfaces/IChange';
import IModel from './interfaces/IModel';

export class History {

  /**
   * History stack
   *
   * @protected
   * @type {IObservableArray<IChange>}
   * @memberOf Model
   */
  protected __history: IObservableArray<IChange> = observable([]);

  /**
   * Current position in the history stack
   *
   * @protected
   * @type {number}
   * @memberOf Model
   */
  protected __historyPointer: number = 0;

  /**
   * The flag that determines if the current change should be saved to history
   *
   * @protected
   * @type {boolean}
   * @memberOf Model
   */
  protected __historyIgnore: boolean = false;

  protected __actionListeners: IObservableArray<(IChange) => any> = observable.shallowArray([]);

  /**
   * Undo the last model change
   *
   * @memberOf Model
   */
  public undo(): void {
    const availableSteps = this.__history.length - this.__historyPointer;

    if (availableSteps > 2) {
      const change = this.__history[this.__historyPointer];
      this.__executeChange(change.key, change.oldValue);
      this.__historyPointer++;
    }
  }

  /**
   * Redo the last model change
   *
   * @memberOf Model
   */
  public redo(): void {
    if (this.__historyPointer > 1) {
      this.__historyPointer--;
      const change = this.__history[this.__historyPointer];
      this.__executeChange(change.key, change.newValue);
    }
  }

  public onAction(callback: (IChange) => any) {
    this.__actionListeners.push(callback);

    return () => {
      this.__actionListeners.remove(callback);
    };
  }

  /**
   * Execute a change on the model without triggering history
   *
   * @protected
   * @param {any} key Property to change
   * @param {any} value New value
   *
   * @memberOf Model
   */
  protected __executeChange(key, value) {
    const historyStatus = this.__historyIgnore;
    this.__historyIgnore = true;
    this[key] = value; // This change needs to be ignored in history!
    this.__historyIgnore = historyStatus;
  }
}
