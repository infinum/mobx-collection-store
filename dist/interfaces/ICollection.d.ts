import IModel from './IModel';
import IModelConstructor from './IModelConstructor';
interface ICollection {
    types: Array<IModelConstructor>;
    add(model: Object, type: string): IModel;
    add(model: IModel): IModel;
    find(type: string, id: string | number): IModel;
    toJS(): Array<Object>;
}
export default ICollection;
