import IModel from './IModel';
import ICollection from './ICollection';
interface IModelConstructor {
    /** Type of the model */
    type: string;
    new (initialData: Object, collection?: ICollection): IModel;
}
export default IModelConstructor;
