import {Collection} from '../src';

// tslint:disable:no-console
// tslint:disable:no-string-literal

const collection = new Collection();

const john = collection.add({
  firstName: 'John',
  id: 1,
  lastName: 'Doe',
});

const jane = collection.add({
  firstName: 'Jane',
  id: 2,
  lastName: 'Doe',
});

console.log(collection.length); // 2

john['lastName'] = 'Williams';
console.log(john['lastName']); // 'Williams'
