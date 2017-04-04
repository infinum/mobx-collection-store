import IDispatch from './IDispatch';
declare type IMiddleware = (reducer: Function, initialState: Object, options: Object) => IDispatch;
export default IMiddleware;
