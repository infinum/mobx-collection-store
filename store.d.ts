/// <reference types="chai" />
declare module "interfaces/IModelConstructor" {
    import IModel from "interfaces/IModel";
    import ICollection from "interfaces/ICollection";
    interface IModelConstructor {
        type: string;
        new (initialData: Object, collection?: ICollection): IModel;
    }
    export default IModelConstructor;
}
declare module "interfaces/ICollection" {
    import IModel from "interfaces/IModel";
    import IModelConstructor from "interfaces/IModelConstructor";
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
}
declare module "interfaces/IDictionary" {
    interface IDictionary {
        [name: string]: any;
    }
    export default IDictionary;
}
declare module "interfaces/IModel" {
    import ICollection from "interfaces/ICollection";
    import IDictionary from "interfaces/IDictionary";
    interface IModel {
        id: string | number;
        collection?: ICollection;
        refs: Object;
        type: string;
        attrs: IDictionary;
        set(key: string, value: any): any;
        update(data: Object): Object;
        toJS(): Object;
    }
    export default IModel;
}
declare module "interfaces/IReferences" {
    interface IReferences {
        [name: string]: string;
    }
    export default IReferences;
}
declare module "consts" {
    export const TYPE_PROP: string;
    export const DEFAULT_TYPE: string;
}
declare module "Model" {
    import { IObservableObject } from 'mobx';
    import IReferences from "interfaces/IReferences";
    import IModel from "interfaces/IModel";
    import ICollection from "interfaces/ICollection";
    class Model implements IModel {
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
}
declare module "Collection" {
    import IModel from "interfaces/IModel";
    import IModelConstructor from "interfaces/IModelConstructor";
    import ICollection from "interfaces/ICollection";
    export class Collection implements ICollection {
        types: Array<IModelConstructor>;
        private data;
        constructor(data?: Array<Object>);
        private __getByType(type);
        private __getModel(type);
        private __initItem(item);
        readonly length: number;
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
}
declare module "index" {
    export { Collection } from "Collection";
    export { Model } from "Model";
    export { default as ICollection } from "interfaces/ICollection";
    export { default as IDictionary } from "interfaces/IDictionary";
    export { default as IModel } from "interfaces/IModel";
    export { default as IModelConstructor } from "interfaces/IModelConstructor";
    export { default as IReferences } from "interfaces/IReferences";
}
