import {useStrict} from 'mobx';
useStrict(true);

import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import {Collection, Model} from '../src';

@suite
class CollectionTest {

  @test
  'basic init'() {
    const collection = new Collection();
    expect(collection.find).to.be.a('function');
  }
}
