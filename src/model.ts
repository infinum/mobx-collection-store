import {observable, extendObservable, toJS, action} from 'mobx';

import IModel from './interfaces/IModel';
import ICollection from './interfaces/ICollection';
import {TYPE} from './consts';

export abstract class Model implements IModel {
  id: string | number
  idAttribute: string = 'id'
  collection?: ICollection = null
  refs: Object = {}
  private data: Object = {}
  abstract type: string

  private getRef(ref: string): Function {
    return () => this.collection.find(this.refs[ref], this.data[ref]);
  }

  @action private setRef(ref: string, val: IModel | string | number): IModel {
    this.data[ref] = val instanceof Model ? val.id : val;
    return this.collection.find(this.refs[ref], this.data[ref]);
  }

  constructor(data: Object) {
    this.data = observable(data);
    this.id = data[this.idAttribute];

    const keys: Array<string> = Object.keys(data);

    const computedProps = {};
    for (const key in keys) {
      computedProps[key] = () => this.data[key];
    }

    const refKeys: Array<string> = Object.keys(this.refs);
    for (const ref in refKeys) {
      computedProps[ref] = this.getRef(ref);
      computedProps[`${ref}Id`] = () => this.data[ref];
    }

    extendObservable(this, computedProps);
  }

  @action set(key: string, value: any) {
    if (key in this.refs) {
      this.setRef(key, value);
    } else {
      this.data[key] = value;
    }

    // Add getters if they don't exist yet
    if (!(key in this.data)) {
      if (key in this.refs) {
        extendObservable(this, {
          [key]: this.getRef(key),
          [`${key}Id`]: () => this.data[key]
        });
      } else {
        extendObservable(this, {
          [key]: () => this.data[key]
        });
      }
    }
  }

  toJS(): Object {
    const data = toJS(this.data);
    data[TYPE] = this.type;
    return data;
  }
};
