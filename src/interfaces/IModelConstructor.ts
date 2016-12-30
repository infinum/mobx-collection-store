import IModel from './IModel';

interface IModelConstructor {
  type: string

  new (initialData: Object): IModel;
}

export default IModelConstructor;
