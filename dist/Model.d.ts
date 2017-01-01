/// <reference types="chai" />
import { IObservableObject } from 'mobx';
import IReferences from './interfaces/IReferences';
import IModel from './interfaces/IModel';
import ICollection from './interfaces/ICollection';
declare class Model implements IModel {
    id: string | number;
    collection?: ICollection;
    static idAttribute: string;
    static refs: IReferences;
    static type: string;
    private data;
    attrs: IObservableObject;
    refs: IObservableObject;
    constructor(initialData: Object, collection?: ICollection);
    private __initRefGetters();
    private __getRef(ref);
    private __getProp(key);
    private __setRef(ref, val);
    private readonly static;
    readonly type: string;
    update(data: IModel | Object): Object;
    set(key: string, value: any): any;
    toJS(): Object;
}
export { Model };
