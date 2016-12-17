import IModel from './IModel';

interface IModelConstructor {
  type: string

  new (d: Object): IModel;
}

export default IModelConstructor;
