/// <reference types="chai" />
import IModel from './IModel';
import IModelConstructor from './IModelConstructor';
interface ICollection {
    types: Array<IModelConstructor>;
    add(model: Object, type?: string): IModel;
    add(model: IModel): IModel;
    add(model: Array<Object>, type?: string): Array<IModel>;
    add(model: Array<IModel>): Array<IModel>;
    find(type: string, id?: string | number): IModel;
    findAll(type: string): Array<IModel>;
    remove(type: string, id?: string | number): IModel;
    removeAll(type: string): Array<IModel>;
    toJS(): Array<Object>;
}
export default ICollection;
