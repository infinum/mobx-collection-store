import IChange from './interfaces/IChange';
import ICollection from './interfaces/ICollection';
import IMiddleware from './interfaces/IMiddleware';
export declare class DevTools {
    private __middlewares;
    constructor(middlewares: Array<IMiddleware>, composer: Function);
    __onAction(change: IChange): void;
    readonly store: {
        liftedStore: {
            getState(): {
                collection: Object[];
            };
            subscribe(...args: any[]): void;
            dispatch(...args: any[]): void;
            mapStateToProps(...args: any[]): void;
            collection: ICollection;
        };
    };
    private __reducer(state, action);
    private __createStore(creator);
}
