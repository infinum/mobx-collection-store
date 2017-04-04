import IDispatch from './IDispatch';

type IMiddleware = (createStore: Function) => (reducer: Function, initialState: Object) => IDispatch;

export default IMiddleware;
