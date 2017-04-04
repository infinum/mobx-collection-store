import IChange from './interfaces/IChange';
import ICollection from './interfaces/ICollection';
import IDispatch from './interfaces/IDispatch';
import IMiddleware from './interfaces/IMiddleware';

export class DevTools {
  private __middlewares: Array<IDispatch> = [];

  constructor(middlewares: Array<IMiddleware>, composer: Function) {
    middlewares.forEach((middleware) => {
      if (middleware) {
        // console.log(middleware)
        // tslint:disable-next-line:max-line-length
        this.__middlewares.push(middleware(this.__createStore.bind(this))(this.__reducer, this.store.liftedStore.getState()) as IDispatch);
      }
    });

    if (composer) {
      // tslint:disable-next-line:max-line-length
      const dispatcher = composer()(this.__createStore.bind(this), {})(this.__reducer, this.store, this.__createStore.bind(this));
      // console.log('dispatcher', dispatcher)
      this.__middlewares.push(dispatcher.dispatch as IDispatch);
    }
  }

  public __onAction(change: IChange) {
    const modelJS = change.model.toJS();
    this.__middlewares.map((middleware) => {
      // debugger
      middleware({
        // tslint:disable-next-line:no-string-literal
        type: `CHANGE_${modelJS['__type__']}_${modelJS['id']}_${change.key}`,
        change,
      });
    });
  }

  public get store() {
    // const collection: ICollection = this;
    return {
      liftedStore: {
        getState() {
          return {
            // collection: collection.toJS(),
          };
        },

        subscribe(...args) {
          // console.log('subscribe', ...args);
        },

        dispatch(...args) {
          // console.log('dispatch', ...args);
        },

        mapStateToProps(...args) {
          // console.log('mapStateToProps', ...args);
        },

        // collection,
      },
    };
  }

  private __reducer(state, action) {
    // console.log('reducer', state, action);
  }

  private __createStore(creator) {
    // console.log('createStore', creator, this);

    creator(this.store.liftedStore.getState(), {type: '@@COLLECTION/INIT'});

    return (...args) => this.store;
  }
}
