import {IObservableObject} from 'mobx';

import ICollection from './ICollection';
import IDictionary from './IDictionary';

interface IModel {
  id: string | number
  collection?: ICollection
  refs: Object
  type: string
  attrs: IDictionary

  set(key: string, value: any): any
  update(data: Object): Object
  toJS(): Object;
}

export default IModel;
