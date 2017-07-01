import patchType from '../enums/patchType';
interface IPatch {
    op: patchType;
    from?: string;
    path: string;
    value?: any;
    oldValue?: any;
}
export default IPatch;
