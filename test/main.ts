// tslint:disable:max-classes-per-file
// tslint:disable:no-string-literal

import {action, autorun, computed, extendObservable, toJS, useStrict} from 'mobx';
useStrict(true);

import {expect} from 'chai';

import {Collection, Model} from '../src';

import {assign} from '../src/utils';

describe('MobX Collection Store', () => {
  it('should do the basic init', () => {
    const collection = new Collection();
    expect(collection.find).to.be.a('function');
  });

  it('should use basic models', () => {
    class FooModel extends Model {
      public static type = 'foo';

      public foo: number;
      public bar: number;
    }

    class TestCollection extends Collection {
      public static types = [FooModel];

      public foo: Array<FooModel>;
    }

    const collection = new TestCollection();
    const model = collection.add<FooModel>({
      bar: 0,
      foo: 1,
      fooBar: 0.5,
      id: 1,
    }, 'foo');

    expect(collection.length).to.equal(1);
    expect(collection.foo.length).to.equal(1);
    expect(collection.find<FooModel>('foo', 1)).to.equal(model);
    expect(model.foo).to.equal(1);
    expect(model.bar).to.equal(0);
    expect(model.static.type).to.equal('foo');
  });

  it('should be able to upsert models', () => {
    class FooModel extends Model {
      public static type = 'foo';

      public foo: number;
      public bar: number;
      public fooBar: number;
    }

    class TestCollection extends Collection {
      public static types = [FooModel];

      public foo: Array<FooModel>;
    }

    const collection = new TestCollection();
    const model = collection.add<FooModel>({
      bar: 0,
      foo: 1,
      fooBar: 0.5,
      id: 1,
    }, 'foo');

    const model2 = collection.add<FooModel>({
      bar: 1,
      foo: 2,
      fooBar: 1.5,
      id: 1,
    }, 'foo');

    expect(collection.length).to.equal(1);
    expect(collection.find('foo', 1)).to.equal(model);
    expect(model.foo).to.equal(2);
    expect(model.bar).to.equal(1);
  });

  it('should support basic relations and serializing', () => {
    class FooModel extends Model {
      public static type = 'foo';
      public static refs = {bar: 'foo', fooBar: 'foo'};

      public foo: number;
      public bar: FooModel;
      public barId: number;
      public fooBar: FooModel;
      public fooBarId: number;
    }

    class TestCollection extends Collection {
      public static types = [FooModel];

      public foo: Array<FooModel>;
    }

    const collection = new TestCollection();
    const model = collection.add<FooModel>({
      bar: 1,
      foo: 0,
      fooBar: 0.5,
      id: 1,
    }, 'foo');

    // Check if the references are ok
    expect(collection.length).to.equal(1);
    expect(collection.find('foo', 1)).to.equal(model);
    expect(model.foo).to.equal(0);
    expect(model.bar).to.equal(model);
    expect(model.barId).to.equal(1);
    expect(model.fooBar).to.equal(null);
    expect(model.fooBarId).to.equal(0.5);
    expect(model.bar.bar).to.equal(model);

    // Clone the collection and check new references
    const collection2 = new TestCollection(collection.toJS());
    const model2 = collection2.find<FooModel>('foo');
    expect(collection2.length).to.equal(1);
    expect(collection2.find('foo', 1)).to.equal(model2);
    expect(model2.foo).to.equal(0);
    expect(model2.bar).to.equal(model2);
    expect(model2.barId).to.equal(1);
    expect(model2.fooBar).to.equal(null);
    expect(model2.fooBarId).to.equal(0.5);
    expect(model2.bar.bar).to.equal(model2);

    // Check if the model is a proper clone
    model.assign('fooBar', 1);
    expect(model.fooBarId).to.equal(1);
    expect(model2.fooBarId).to.equal(0.5);

    // Try to remove a non-existing model
    collection.remove('foo', 2);
    expect(collection.length).to.equal(1);

    // Remove a model and check that it still exists in the cloned collection
    collection.remove('foo', 1);
    expect(collection.length).to.equal(0);
    expect(collection2.length).to.equal(1);

    // Try to remove all models of an unexisting type
    collection2.removeAll('foobar');
    expect(collection2.length).to.equal(1);

    // Remove all models of the foo type
    collection2.removeAll('foo');
    expect(collection2.length).to.equal(0);
  });

  it('should work for the readme example', () => {
    class Person extends Model {
      public static type = 'person';
      public static refs = {spouse: 'person'};

      public firstName: string;
      public lastName: string;
      public spouse: Person;

      @computed public get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
      }
    }

    class Pet extends Model {
      public static type = 'pet';
      public static refs = {owner: 'person'};

      public owner: Person;
      public ownerId: number;
    }

    class MyCollection extends Collection {
      public static types = [Person, Pet];
      public person: Array<Person>;
      public pet: Array<Pet>;
    }

    const collection = new MyCollection();

    const john = collection.add<Person>({
      firstName: 'John',
      id: 1,
      lastName: 'Doe',
      spouse: 2,
    }, 'person');

    const fido = collection.add<Pet>({
      id: 1,
      name: 'Fido',
      owner: john,
    }, 'pet');

    const jane = new Person({
      firstName: 'Jane',
      id: 2,
      lastName: 'Doe',
      spouse: 1,
    });
    collection.add(jane);

    expect(john.spouse.fullName).to.equal('Jane Doe');
    expect(fido.owner.fullName).to.equal('John Doe');
    expect(fido.owner.spouse.fullName).to.equal('Jane Doe');
    expect(collection.person.length).to.equal(2);
    expect(collection.length).to.equal(3);

    fido.assign('owner', {
      firstName: 'Dave',
      id: 3,
      lastName: 'Jones',
    });

    expect(fido.owner.fullName).to.equal('Dave Jones');
    expect(fido.ownerId).to.equal(3);
    expect(collection.person.length).to.equal(3);
    expect(collection.length).to.equal(4);

    fido.owner = jane;
    expect(fido.owner.fullName).to.equal('Jane Doe');

    expect(collection.length).to.equal(4);
    collection.reset();
    expect(collection.length).to.equal(0);
  });

  it('should support default props', () => {
    class FooModel extends Model {
      public static type = 'foo';
      public static defaults = {
        foo: 4,
      };

      public foo: number;
      public bar: number;
    }

    class TestCollection extends Collection {
      public static types = [FooModel];

      public foo: Array<FooModel>;
    }

    const collection = new TestCollection();

    const model1 = collection.add<FooModel>({
      bar: 0,
      foo: 1,
      fooBar: 0.5,
      id: 1,
    }, 'foo');

    expect(model1.foo).to.equal(1);

    const model2 = collection.add<FooModel>({
      bar: 0,
      fooBar: 0.5,
      id: 2,
    }, 'foo');

    expect(model2.foo).to.equal(4);
  });

  it('should support array refereces', action(() => {
    class FooModel extends Model {
      public static type = 'foo';

      public static refs = {fooBar: 'foo'};

      public id: number;
      public foo: number;
      public bar: number;
      public fooBar: FooModel|Array<FooModel>;
      public fooBarId: number|Array<number>;
    }

    class TestCollection extends Collection {
      public static types = [FooModel];

      public foo: Array<FooModel>;
    }

    const collection = new TestCollection();

    const models = collection.add<FooModel>([{
      foo: 1,
      id: 1,
    }, {
      foo: 2,
      id: 2,
    }, {
      foo: 3,
      id: 3,
    }, {
      foo: 4,
      id: 4,
    }] as Array<Object>, 'foo');

    const first = models.shift();
    const second = models.shift();
    expect(collection.length).to.equal(4);

    first.fooBar = models;
    expect(collection.length).to.equal(4);
    expect(first.fooBar).to.have.length(2);
    expect(first.fooBar[1].foo).to.equal(4);
    expect(JSON.stringify(first.fooBarId)).to.equal(JSON.stringify(models.map((model) => model.id)));

    first.fooBar.push(second);
    expect(first.fooBar).to.have.length(3);
    expect(first.fooBar[2].foo).to.equal(2);
  }));

  it('should call autorun when needed', (done) => {
    class FooModel extends Model {
      public static type = 'foo';

      public foo: number;
      public bar: number;
    }

    class TestCollection extends Collection {
      public static types = [FooModel];

      public foo: Array<FooModel>;
    }

    const collection = new TestCollection();

    const model = collection.add<FooModel>({
      bar: 3,
      foo: 1,
      id: 1,
    }, 'foo');

    let runs = 0;
    const expected = [1, 3, 5];
    autorun(() => {
      expect(model.foo).to.equal(expected[runs]);
      runs++;

      if (runs === 3) {
        done();
      }
    });

    model.foo = 3;
    model.bar = 123;
    model.foo = 5;
  });

  it('should support dynamic references', () => {
    class FooModel extends Model {
      public static type = 'foo';

      public foo: number;
    }

    class TestCollection extends Collection {
      public static types = [FooModel];

      public foo: Array<FooModel>;
    }

    const collection = new TestCollection();

    const models = collection.add<FooModel>([{
      foo: 1,
      id: 1,
    }, {
      foo: 2,
      id: 2,
    }, {
      foo: 3,
      id: 3,
    }, {
      foo: 4,
      id: 4,
    }] as Array<Object>, 'foo');

    const first = models.shift();

    first.assignRef('bar', models, 'foo');
    expect(first['bar']).to.have.length(3);
    expect(first['bar'][1].foo).to.equal(3);
  });

  it('should support generic references', () => {
    const collection = new Collection();

    const models = collection.add<Model>([{
      foo: 1,
      id: 1,
    }, {
      foo: 2,
      id: 2,
    }, {
      foo: 3,
      id: 3,
    }, {
      foo: 4,
      id: 4,
    }] as Array<Object>);

    const first = models.shift();

    first.assignRef('bar', models);
    expect(first['bar']).to.have.length(3);
    expect(first['bar'][1].foo).to.equal(3);
  });

  it('should work with autoincrement', () => {
    class Foo extends Model {
      public static type = 'foo';
      public static idAttribute = 'myID';
      public myID: number;
    }

    class Bar extends Model {
      public static type = 'bar';
      public static enableAutoId = false;
      public id: number;
    }

    class Baz extends Model {
      public static type = 'baz';
      public static autoId() {
        return Math.random();
      }
      public id: number;
    }

    class TestCollection extends Collection {
      public static types = [Foo, Bar, Baz];
      public foo: Array<Foo>;
    }

    const collection = new TestCollection();

    const foo1 = collection.add<Foo>({bar: 1}, 'foo');
    const foo2 = collection.add<Foo>({bar: 1}, 'foo');
    const foo10 = collection.add<Foo>({myID: 10, bar: 1}, 'foo');
    const foo3 = collection.add<Foo>({bar: 1}, 'foo');
    const foo4 = collection.add<Foo>({myID: 4, bar: 1}, 'foo');
    const foo5 = collection.add<Foo>({bar: 1}, 'foo');

    expect(collection.foo.length).to.equal(6);
    expect(foo5.myID).to.equal(5);
    expect(foo10.myID).to.equal(10);

    const bar5 = collection.add<Bar>({id: 5}, 'bar');
    expect(bar5.id).to.equal(5);
    expect(() => collection.add<Bar>({foo: 1}, 'bar')).to.throw();

    const baz1 = collection.add<Baz>({}, 'baz');
    expect(baz1.id).to.be.within(0, 1);
  });

  it('should support typeAttribute', () => {
    class TestModel extends Model {
      public static typeAttribute = 'foo';
    }

    class TestCollection extends Collection {
      public static types = [TestModel];
    }

    const collection = new TestCollection();

    const model = new TestModel({id: 1, foo: 'bar'});
    collection.add(model);

    const bar = collection.findAll('bar');
    expect(bar.length).to.equal(1);

    const baz = collection.findAll('baz');
    expect(baz.length).to.equal(0);
  });

  it('should handle null references', () => {
    class Foo extends Model {
      public static type = 'foo';
    }

    class TestCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new TestCollection();
    const model = collection.add<Foo>({}, 'foo');
    model.assign('foo', 1);
    model.assignRef('self', model, 'foo');
    model.assignRef('self2', model);
    model.assignRef('empty', null);

    expect(model['self']).to.equal(model);
    expect(model['self2']).to.equal(model);
    expect(model['empty']).to.equal(null);
  });

  it('should support references during collection add', () => {
    class Foo extends Model {
      public static type = 'foo';

      public static refs = {bar: 'bar'};

      public foo: number;
      public bar: Bar|Array<Bar>;
    }

    class Bar extends Model {
      public static type = 'bar';
      public bar: number;
    }

    class TestCollection extends Collection {
      public static types = [Foo, Bar];
      public foo: Array<Foo>;
      public bar: Array<Bar>;
    }

    const collection = new TestCollection();

    const foo = collection.add<Foo>({
      bar: {
        bar: 3,
        id: 4,
      },
      foo: 2,
      id: 1,
    }, 'foo');

    expect(foo.foo).to.equal(2);
    expect(foo.bar['bar']).to.equal(3);
    expect(collection.foo).to.have.length(1);
    expect(collection.bar).to.have.length(1);

    const foo2 = collection.add<Foo>({
      bar: [{
        bar: 8,
        id: 7,
      }, {
        bar: 10,
        id: 9,
      }],
      foo: 6,
      id: 5,
    }, 'foo');

    expect(foo2.bar[0].bar).to.equal(8);
    expect(foo2.bar[1].bar).to.equal(10);
    expect(collection.foo).to.have.length(2);
    expect(collection.bar).to.have.length(3);
  });

  it('should work for a real world scenario', () => {
    class User extends Model {
      public static type = 'user';
      public email: string;
    }

    class Cart extends Model {
      public static type = 'cart';
      public static refs = {user: 'user', products: 'cartItem'};
      public user: User|Array<User>;
      public products: CartItem|Array<CartItem>;
      public id: number;
    }

    class CartItem extends Model {
      public static type = 'cartItem';
      public static refs = {product: 'products'};
      public product: Product|Array<Product>;
      public quantity: number;
      public id: number;
    }

    class Product extends Model {
      public static type = 'products';
      public name: string;
      public price: number;
    }

    class TestCollection extends Collection {
      public static types = [User, Cart, CartItem, Product];
      public user: Array<User>;
      public cart: Array<Cart>;
      public cartItem: Array<CartItem>;
      public products: Array<Product>;
    }

    const collection = new TestCollection();

    const cart = collection.add<Cart>({
      id: 1,
      products: [{
        product: {
          id: 1,
          name: 'Electrons',
          price: 9.99,
        },
        quantity: 8,
      }, {
        product: {
          id: 2,
          name: 'Protons',
          price: 5.99,
        },
        quantity: 2,
      }],
      user: {
        email: 'test@example.com',
        id: 1,
        role: 1,
        token: 'dc9dcd8116673372e96cc0410821da6a',
        username: 'jdoe42',
      },
    }, 'cart');

    expect(collection.user).to.have.length(1);
    expect(collection.cart).to.have.length(1);
    expect(collection.cartItem).to.have.length(2);
    expect(collection.products).to.have.length(2);
    expect(cart.user['email']).to.equal('test@example.com');
    expect(cart.products).to.have.length(2);
    expect(cart.products[0].quantity).to.equal(8);
    expect(cart.products[1].quantity).to.equal(2);
    expect(cart.products[0].product.name).to.equal('Electrons');
  });

  it('should work with preprocess', () => {
    class Foo extends Model {
      public static type = 'foo';
      public static refs = {bar: 'bar'};
      public static preprocess(rawData) {
        return assign({newProp: 1}, rawData);
      }
      public bar: Bar|Array<Bar>;
    }

    class Bar extends Model {
      public static type = 'bar';
      public static preprocess(rawData) {
        return assign({barProp: 2}, rawData);
      }
    }

    class TestCollection extends Collection {
      public static types = [Foo, Bar];
    }

    const collection = new TestCollection();

    const foo = collection.add<Foo>({
      bar: [{
        bar: 8,
        id: 7,
      }, {
        bar: 10,
        id: 9,
      }],
      foo: 6,
      id: 5,
    }, 'foo');

    expect(foo['newProp']).to.equal(1);
    expect(foo.bar[0]['barProp']).to.equal(2);
    expect(foo.bar[1]['barProp']).to.equal(2);
  });

  it('should update an exiting reference', () => {
    class Foo extends Model {
      public static type = 'foo';
      public static refs = {self: 'foo'};

      public self: Foo|Array<Foo>;
      public id: number;
      public foo: number;
    }

    class TestCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new TestCollection();

    const model = collection.add<Foo>({id: 1, foo: 2, self: 1}, 'foo');

    expect(model.self).to.equal(model);

    model.assignRef('self', model);

    expect(model.self).to.equal(model);
  });

  it('should not update a reserved key', () => {
    class Foo extends Model {
      public static type = 'foo';
      public id: number;
      public foo: number;
    }

    class TestCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new TestCollection();
    const model = collection.add<Foo>({id: 1, foo: 2}, 'foo');

    expect(model.assign).to.be.a('function');
    expect(model.id).to.equal(1);
    model.update({id: 2, assign: true, foo: 3});
    expect(model.assign).to.be.a('function');
    expect(model.id).to.equal(1);
    expect(model.foo).to.equal(3);
  });

  it('should suport updating the array items in the reference', action(() => {
    class Foo extends Model {
      public static type = 'foo';
      public static refs = {bar: 'foo'};
      public id: number;
      public foo: number;
      public bar: Foo|Array<Foo>;
    }

    class TestCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new TestCollection();
    const model1 = collection.add<Foo>({id: 1, foo: 2, bar: [1]}, 'foo');
    const model2 = collection.add<Foo>({id: 2, foo: 4, bar: [1, 1, 2]}, 'foo');

    expect(model2.bar[0]).to.equal(model1);
    expect(model2.bar).to.have.length(3);

    model2.bar[0] = model2;
    expect(model2.bar[0]).to.equal(model2);
    expect(model2.bar).to.have.length(3);
  }));

  it('should validate the reference types', action(() => {
    class Foo extends Model {
      public static type = 'foo';
      public static refs = {foo: 'foo'};
      public foo: any; // This would usually be Foo|Array<Foo>, but we need to test the other cases
    }

    class Bar extends Model {
      public static type = 'bar';
    }

    class TestCollection extends Collection {
      public static types = [Foo, Bar];
    }

    const collection = new TestCollection();
    const foo = collection.add<Foo>({id: 1, foo: 1}, 'foo');
    const bar = collection.add<Bar>({id: 2, bar: 3}, 'bar');

    expect(foo.foo).to.equal(foo);

    expect(() => {
      foo.foo = bar;
    }).to.throw();

    expect(foo.foo).to.equal(foo);
  }));
});
