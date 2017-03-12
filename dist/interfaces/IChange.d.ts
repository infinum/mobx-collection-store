import IModel from './IModel';
interface IChange {
    model: IModel;
    key: string;
    oldValue: any;
    newValue: any;
    timestamp: number;
}
export default IChange;
