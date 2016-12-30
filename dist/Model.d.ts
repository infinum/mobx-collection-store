import { IObservableObject } from 'mobx';
import IReferences from './interfaces/IReferences';
import IModel from './interfaces/IModel';
import ICollection from './interfaces/ICollection';
declare abstract class Model implements IModel {
    id: string | number;
    collection?: ICollection;
    static idAttribute: string;
    static refs: IReferences;
    static type: string;
    private data;
    attrs: IObservableObject;
    refs: IObservableObject;
    constructor(initialData: Object, collection?: ICollection);
    private initRefGetters();
    private getRef(ref);
    private getProp(key);
    private setRef(ref, val);
    private readonly static;
    readonly idAttribute: string;
    readonly type: string;
    readonly refDefs: IReferences;
    readonly keys: Array<string>;
    update(data: IModel | Object): Object;
    set(key: string, value: any): any;
    toJS(): Object;
}
export { Model };
