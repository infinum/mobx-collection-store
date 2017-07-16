import IType from './IType';
declare type IOpts = IType | {
    id?: string | number;
    type?: IType;
};
export default IOpts;
