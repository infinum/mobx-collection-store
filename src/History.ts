import {IObservableArray, observable} from 'mobx';

import IChange from './interfaces/IChange';
import IModel from './interfaces/IModel';

export class History {

  /**
   * History stack
   *
   * @private
   * @type {IObservableArray<IChange>}
   * @memberOf Model
   */
  private __history: IObservableArray<IChange> = observable([]);

  /**
   * Current position in the history stack
   *
   * @private
   * @type {number}
   * @memberOf Model
   */
  private __historyPointer: number = 0;

  /**
   * The flag that determines if the current change should be saved to history
   *
   * @private
   * @type {boolean}
   * @memberOf Model
   */
  private __historyIgnore: boolean = false;

  private __actionListeners: IObservableArray<(IChange) => any> = observable.shallowArray([]);

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
  protected __addStep(model: IModel, key: string, oldValue: any, newValue: any): void {
    if (!this.__historyIgnore) {
      const change: IChange = {model, key, oldValue, newValue, timestamp: Date.now()};

      // TODO: Should probably be optimized
      this.__history.replace([change, ...this.__history.slice(this.__historyPointer)]);
      this.__historyPointer = 0;

      this.__actionListeners.forEach((callback) => {
        callback(change);
      });
    }
  }
}
