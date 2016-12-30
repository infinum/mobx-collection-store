import {useStrict} from 'mobx';

import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import {Collection, Model, IModelConstructor} from '../src';

@suite
class CollectionTest {

  @test
  'basic init'() {
    const collection = new Collection();
    expect(collection.find).to.be.a('function');
  }

  @test
  'basic models'() {
    class FooModel extends Model {
      static type = 'foo'
    }

    class TestCollection extends Collection {
      types: Array<IModelConstructor> = [FooModel]
    }

    const collection = new TestCollection();
    const model = collection.add({
      id: 1,
      foo: 1,
      bar: 0,
      fooBar: 0.5
    }, 'foo');

    expect(collection.length).to.equal(1);
    expect(collection.find('foo', 1)).to.equal(model);
    expect(model.id).to.equal(1);
    expect(model['bar']).to.equal(0);
  }
}
