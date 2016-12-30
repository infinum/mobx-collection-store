import IModel from './interfaces/IModel';
import IModelConstructor from './interfaces/IModelConstructor';
import ICollection from './interfaces/ICollection';
export declare class Collection implements ICollection {
    types: Array<IModelConstructor>;
    private data;
    constructor(data?: Array<Object>);
    private getByType(type);
    private getModel(type);
    private initItem(item);
    readonly length: number;
    add(model: Object, type: string): IModel;
    add(model: IModel): IModel;
    add(model: Array<Object>, type: string): Array<IModel>;
    add(model: Array<IModel>): Array<IModel>;
    find(type: string, id?: string | number): IModel;
    findAll(type: string): Array<IModel>;
    remove(type: string, id?: string | number): IModel;
    removeAll(type: string): Array<IModel>;
    toJS(): Array<Object>;
}
