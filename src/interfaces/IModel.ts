import ICollection from './ICollection';

interface IModel {
  id: string | number
  idAttribute: string
  collection?: ICollection
  refs: Object
  type: string

  update(data: Object): Object
  toJS(): Object;
}

export default IModel;
