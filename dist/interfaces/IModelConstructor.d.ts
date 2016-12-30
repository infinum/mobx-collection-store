import IModel from './IModel';
import ICollection from './ICollection';
interface IModelConstructor {
    type: string;
    new (initialData: Object, collection?: ICollection): IModel;
}
export default IModelConstructor;
