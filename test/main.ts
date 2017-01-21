import {computed, extendObservable, autorun, useStrict, action} from 'mobx';
useStrict(true);

const expect = require('chai').expect;

import {Collection, Model} from '../src';

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
    expect(model.__id).to.equal(1);
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
    expect(model.__id).to.equal(1);
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
    expect(model.__id).to.equal(1);
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
    expect(model2.__id).to.equal(1);
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
    expect(JSON.stringify(first.fooBarId)).to.equal(JSON.stringify(models.map((model) => model.__id)));

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
});
