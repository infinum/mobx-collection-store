import {observable, extendObservable, toJS, runInAction} from 'mobx';

import IModel from './interfaces/IModel';
import ICollection from './interfaces/ICollection';
import {TYPE} from './consts';

abstract class Model implements IModel {
  id: string | number
  idAttribute: string = 'id'
  collection?: ICollection = null
  refs: Object = {}
  private data: Object = {}
  abstract type: string

  private getRef(ref: string): Function {
    return () => this.collection.find(ref, this.data[ref]);
  }

  private setRef(ref: string): Function {
    return (val) => {
      runInAction(() => {
        this.data[ref] = val instanceof Model ? val.id : val;
      });
      return this.collection.find(ref, this.data[ref]);
    };
  }

  constructor(data: Object) {
    this.data = observable(data);
    this.id = data[this.idAttribute];

    const keys: Array<string> = Object.keys(data);

    const computedProps = {};
    for (const key in keys) {
      computedProps[key] = () => this.data[key];
      computedProps[key] = (val) => this.data[key] = val;
    }

    const refKeys: Array<string> = Object.keys(this.refs);
    for (const ref in refKeys) {
      computedProps[ref] = this.getRef(ref);
      computedProps[ref] = this.setRef(ref);
    }

    extendObservable(this, computedProps);
  }

  toJS(): Object {
    const data = toJS(this.data);
    data[TYPE] = this.type;
    return data;
  }
};

export default Model;
