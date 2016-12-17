import ICollection from './ICollection';

interface IModel {
  id: string | number
  idAttribute: string
  collection?: ICollection
  refs: Object
  type: string

  toJS(): Object;
}

export default IModel;
