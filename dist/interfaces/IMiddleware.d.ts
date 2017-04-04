import IDispatch from './IDispatch';
declare type IMiddleware = (createStore: Function) => (reducer: Function, initialState: Object) => IDispatch;
export default IMiddleware;
