import ICollection from './ICollection';
import IDictionary from './IDictionary';
interface IModel {
    id: string | number;
    idAttribute: string;
    collection?: ICollection;
    refs: Object;
    type: string;
    attrs: IDictionary;
    update(data: Object): Object;
    toJS(): Object;
}
export default IModel;
