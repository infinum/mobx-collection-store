import {computed, extendObservable, autorun, useStrict, action, toJS} from 'mobx';
useStrict(true);

const expect = require('chai').expect;

import {Collection, Model} from '../src';

import {assign} from '../src/utils';

describe('MobX Collection Store', function() {
  it('should do the basic init', function() {
    const collection = new Collection();
    expect(collection.find).to.be.a('function');
  });

  it('should use basic models', function() {
    class FooModel extends Model {
      static type = 'foo';

      foo: number;
      bar: number;
    }

    class TestCollection extends Collection {
      static types = [FooModel];

      foo: Array<FooModel>;
    }

    const collection = new TestCollection();
    const model = collection.add<FooModel>({
      id: 1,
      foo: 1,
      bar: 0,
      fooBar: 0.5
    }, 'foo');

    expect(collection.length).to.equal(1);
    expect(collection.foo.length).to.equal(1);
    expect(collection.find<FooModel>('foo', 1)).to.equal(model);
    expect(model.foo).to.equal(1);
    expect(model.bar).to.equal(0);
    expect(model.static.type).to.equal('foo');
  });

  it('should be able to upsert models', function() {
    class FooModel extends Model {
      static type = 'foo';

      foo: number;
      bar: number;
      fooBar: number;
    }

    class TestCollection extends Collection {
      static types = [FooModel];

      foo: Array<FooModel>;
    }

    const collection = new TestCollection();
    const model = collection.add<FooModel>({
      id: 1,
      foo: 1,
      bar: 0,
      fooBar: 0.5
    }, 'foo');

    const model2 = collection.add<FooModel>({
      id: 1,
      foo: 2,
      bar: 1,
      fooBar: 1.5
    }, 'foo');

    expect(collection.length).to.equal(1);
    expect(collection.find('foo', 1)).to.equal(model);
    expect(model.foo).to.equal(2);
    expect(model.bar).to.equal(1);
  });

  it('should support basic relations and serializing', function() {
    class FooModel extends Model {
      static type = 'foo';
      static refs = {bar: 'foo', fooBar: 'foo'};

      foo: number
      bar: FooModel;
      barId: number;
      fooBar: FooModel;
      fooBarId: number;
    }

    class TestCollection extends Collection {
      static types = [FooModel];

      foo: Array<FooModel>;
    }

    const collection = new TestCollection();
    const model = collection.add<FooModel>({
      id: 1,
      foo: 0,
      bar: 1,
      fooBar: 0.5
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

  it('should work for the readme example', function() {
    class Person extends Model {
      static type = 'person';
      static refs = {spouse: 'person'};

      firstName: string;
      lastName: string;
      spouse: Person;

      @computed get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
      }
    }

    class Pet extends Model {
      static type = 'pet';
      static refs = {owner: 'person'}

      owner: Person;
      ownerId: number;
    }

    class MyCollection extends Collection {
      static types = [Person, Pet]
      person: Array<Person>;
      pet: Array<Pet>;
    }

    const collection = new MyCollection();

    const john = collection.add<Person>({
      id: 1,
      spouse: 2,
      firstName: 'John',
      lastName: 'Doe'
    }, 'person');

    const fido = collection.add<Pet>({
      id: 1,
      owner: john,
      name: 'Fido'
    }, 'pet');

    const jane = new Person({
      id: 2,
      spouse: 1,
      firstName: 'Jane',
      lastName: 'Doe'
    });
    collection.add(jane);

    expect(john.spouse.fullName).to.equal('Jane Doe');
    expect(fido.owner.fullName).to.equal('John Doe');
    expect(fido.owner.spouse.fullName).to.equal('Jane Doe');
    expect(collection.person.length).to.equal(2);
    expect(collection.length).to.equal(3);

    fido.assign('owner', {
      id: 3,
      firstName: 'Dave',
      lastName: 'Jones'
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

  it('should support default props', function() {
    class FooModel extends Model {
      static type = 'foo';
      static defaults = {
        foo: 4
      };

      foo: number;
      bar: number;
    }

    class TestCollection extends Collection {
      static types = [FooModel];

      foo: Array<FooModel>;
    }

    const collection = new TestCollection();

    const model1 = collection.add<FooModel>({
      id: 1,
      foo: 1,
      bar: 0,
      fooBar: 0.5
    }, 'foo');

    expect(model1.foo).to.equal(1);

    const model2 = collection.add<FooModel>({
      id: 2,
      bar: 0,
      fooBar: 0.5
    }, 'foo');

    expect(model2.foo).to.equal(4);
  });

  it('should support array refereces', action(function() {
    class FooModel extends Model {
      static type = 'foo';

      static refs = {fooBar: 'foo'};

      id: number;
      foo: number;
      bar: number;
      fooBar: FooModel|Array<FooModel>;
      fooBarId: number|Array<number>;
    }

    class TestCollection extends Collection {
      static types = [FooModel];

      foo: Array<FooModel>;
    }

    const collection = new TestCollection();

    const models = collection.add<FooModel>([{
      id: 1,
      foo: 1,
    }, {
      id: 2,
      foo: 2
    }, {
      id: 3,
      foo: 3
    }, {
      id: 4,
      foo: 4
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

  it('should call autorun when needed', function(done) {
    class FooModel extends Model {
      static type = 'foo';

      foo: number;
      bar: number;
    }

    class TestCollection extends Collection {
      static types = [FooModel];

      foo: Array<FooModel>;
    }

    const collection = new TestCollection();

    const model = collection.add<FooModel>({
      id: 1,
      foo: 1,
      bar: 3
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

  it('should support dynamic references', function() {
    class FooModel extends Model {
      static type = 'foo';


      foo: number;
    }

    class TestCollection extends Collection {
      static types = [FooModel];

      foo: Array<FooModel>;
    }

    const collection = new TestCollection();

    const models = collection.add<FooModel>([{
      id: 1,
      foo: 1,
    }, {
      id: 2,
      foo: 2
    }, {
      id: 3,
      foo: 3
    }, {
      id: 4,
      foo: 4
    }] as Array<Object>, 'foo');

    const first = models.shift();

    first.assignRef('bar', models, 'foo');
    expect(first['bar']).to.have.length(3);
    expect(first['bar'][1].foo).to.equal(3);
  });

  it('should support generic references', function() {
    const collection = new Collection();

    const models = collection.add<Model>([{
      id: 1,
      foo: 1,
    }, {
      id: 2,
      foo: 2
    }, {
      id: 3,
      foo: 3
    }, {
      id: 4,
      foo: 4
    }] as Array<Object>);

    const first = models.shift();

    first.assignRef('bar', models);
    expect(first['bar']).to.have.length(3);
    expect(first['bar'][1].foo).to.equal(3);
  });

  it('should work with autoincrement', function() {
    class Foo extends Model {
      static type = 'foo';
      static idAttribute = 'myID';
      myID: number;
    }

    class Bar extends Model {
      static type = 'bar';
      static enableAutoId = false;
      id: number;
    }

    class Baz extends Model {
      static type = 'baz';
      static autoIdFunction() {
        return Math.random();
      }
      id: number;
    }

    class TestCollection extends Collection {
      static types = [Foo, Bar, Baz];
      foo: Array<Foo>;
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

  it('should support typeAttribute', function() {
    class TestModel extends Model {
      static typeAttribute = 'foo';
    }

    class TestCollection extends Collection {
      static types = [TestModel];
    }

    const collection = new TestCollection();

    const model = new TestModel({id: 1, foo: 'bar'});
    collection.add(model);

    const bar = collection.findAll('bar');
    expect(bar.length).to.equal(1);

    const baz = collection.findAll('baz');
    expect(baz.length).to.equal(0);
  });

  it('should handle null references', function() {
    class Foo extends Model {
      static type = 'foo';
    }

    class TestCollection extends Collection {
      static types = [Foo];
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

  it('should support references during collection add', function() {
    class Foo extends Model {
      static type = 'foo';

      static refs = {bar: 'bar'}

      foo: number;
      bar: Bar|Array<Bar>
    }

    class Bar extends Model {
      static type = 'bar';
      bar: number;
    }

    class TestCollection extends Collection {
      static types = [Foo, Bar];
      foo: Array<Foo>;
      bar: Array<Bar>;
    }

    const collection = new TestCollection();

    const foo = collection.add<Foo>({
      foo: 2,
      id: 1,
      bar: {
        id: 4,
        bar: 3
      }
    }, 'foo');

    expect(foo.foo).to.equal(2);
    expect(foo.bar['bar']).to.equal(3);
    expect(collection.foo).to.have.length(1);
    expect(collection.bar).to.have.length(1);

    const foo2 = collection.add<Foo>({
      foo: 6,
      id: 5,
      bar: [{
        id: 7,
        bar: 8
      }, {
        id: 9,
        bar: 10
      }]
    }, 'foo');

    expect(foo2.bar[0].bar).to.equal(8);
    expect(foo2.bar[1].bar).to.equal(10);
    expect(collection.foo).to.have.length(2);
    expect(collection.bar).to.have.length(3);
  });

  it('should work for a real world scenario', function() {
    class User extends Model {
      static type = 'user';
      email: string;
    }

    class Cart extends Model {
      static type = 'cart';
      static refs = {user: 'user', products: 'cartItem'};
      user: User|Array<User>;
      products: CartItem|Array<CartItem>;
      id: number;
    }

    class CartItem extends Model {
      static type = 'cartItem';
      static refs = {product: 'products'};
      product: Product|Array<Product>;
      quantity: number;
      id: number;
    }

    class Product extends Model {
      static type = 'products';
      name: string;
      price: number;
    }

    class TestCollection extends Collection {
      static types = [User, Cart, CartItem, Product];
      user: Array<User>;
      cart: Array<Cart>;
      cartItem: Array<CartItem>;
      products: Array<Product>;
    }

    const collection = new TestCollection();

    const cart = collection.add<Cart>({
      "id": 1,
      "user": {
        "id": 1,
        "username": "jdoe42",
        "email": "test@example.com",
        "token": "dc9dcd8116673372e96cc0410821da6a",
        "role": 1
      },
      "products": [{
        "product": {
          "id": 1,
          "name": "Electrons",
          "price": 9.99
        },
        "quantity": 8
      }, {
        "product": {
          "id": 2,
          "name": "Protons",
          "price": 5.99
        },
        "quantity": 2
      }]
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

  it('should work with preprocess', function() {
    class Foo extends Model {
      static type = 'foo';
      static refs = {bar: 'bar'};
      static preprocess(rawData) {
        return assign({newProp: 1}, rawData);
      }
      bar: Bar|Array<Bar>;
    }

    class Bar extends Model {
      static type = 'bar';
      static preprocess(rawData) {
        return assign({barProp: 2}, rawData);
      }
    }

    class TestCollection extends Collection {
      static types = [Foo, Bar];
    }

    const collection = new TestCollection();

    const foo = collection.add<Foo>({
      foo: 6,
      id: 5,
      bar: [{
        id: 7,
        bar: 8
      }, {
        id: 9,
        bar: 10
      }]
    }, 'foo');

    expect(foo['newProp']).to.equal(1);
    expect(foo.bar[0]['barProp']).to.equal(2);
    expect(foo.bar[1]['barProp']).to.equal(2);
  });

  it('should update an exiting reference', function() {
    class Foo extends Model {
      static type = 'foo';
      static refs = {self: 'foo'};

      self: Foo|Array<Foo>;
      id: number;
      foo: number;
    }

    class TestCollection extends Collection {
      static types = [Foo]
    }

    const collection = new TestCollection();

    const model = collection.add<Foo>({id: 1, foo: 2, self: 1}, 'foo');

    expect(model.self).to.equal(model);

    model.assignRef('self', model);

    expect(model.self).to.equal(model);
  });

  it('should not update a reserved key', function() {
    class Foo extends Model {
      static type = 'foo';
      id: number;
      foo: number;
    }

    class TestCollection extends Collection {
      static types = [Foo]
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

  it('should suport updating the array items in the reference', action(function() {
    class Foo extends Model {
      static type = 'foo';
      static refs = {bar: 'foo'}
      id: number;
      foo: number;
      bar: Foo|Array<Foo>;
    }

    class TestCollection extends Collection {
      static types = [Foo]
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
});
