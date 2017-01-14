# mobx-collection-store

Data store for MobX. Influenced by [Backbone Collections](http://backbonejs.org/#Collection) and [mobx-jsonapi-store](https://github.com/infinum/mobx-jsonapi-store).

## Work in progress...
Functionality is mostly there, but the API still might change significantly. Also, the docs are missing.

## Basic usage

```javascript
import {Collection} from 'mobx-collection-store';

const collection = new Collection();

const john = collection.add({
  id: 1,
  firstName: 'John',
  lastName: 'Doe'
});

const jane = collection.add({
  id: 2,
  firstName: 'Jane',
  lastName: 'Doe'
});

console.log(collection.length); // 2

john.set('lastName', 'Williams');
console.log(john.lastName); // 'Williams'
```
## Installation

***Still not working***

```bash
npm install --save mobx-collection-store
```

### Dependencies

The only (peer) dependency of this lib is `mobx` version 2.7.0 or newer (including MobX 3).

### TypeScript

Since this lib was written using TypeScript, it also exposes TS typings. If you're not using TypeScript for your development, this won't be relevant to you.

### Usage

Since the lib is exposed as a set of `CommonJS` modules, you'll need something like [`webpack`](https://webpack.js.org/concepts/) or `browserify` in order to use it in the browser.

Don't forget to minify your code before production for better performance!

## Advanced examples

### Relationships

In order to use relationships, you'll need to create new model and collection classes that extend the original ones:

```javascript
import {computed, extendObservable} from 'mobx';
import {Model, Collection} from 'mobx-collection-store';

class Person extends Model {

  // The ES2015 way to add a computed property
  // This is not a requirement for the library, but it's a very useful mobx feature
  constructor(...args) {
    super(...args);
    extendObservable(this, {
      fullName: computed(() => `${this.attrs.firstName} ${this.attrs.lastName}`)
    });
  }

  // Cleaner synthax if you're using decorators
  // @computed get fullName() {
  //   return `${this.attrs.firstName} ${this.attrs.lastName}`;
  // }
}
Person.type = 'person';
Person.refs = {spouse: 'person'};

class Pet extends Model {}
Pet.type = 'pet';
Pet.refs = {owner: 'person'};

class MyCollection extends Collection {}
MyCollection.types = [Person, Pet];

const collection = new MyCollection();

const john = collection.add({
  id: 1,
  spouse: 2,
  firstName: 'John',
  lastName: 'Doe'
}, 'person'); // Note the model type as the 2nd argument to the add method

const fido = collection.add({
  id: 1,
  owner: john, // The reference can be a model, an object or the model id
  name: 'Fido'
}, 'pet');

const jane = new Person({
  id: 2,
  spouse: 1,
  firstName: 'Jane',
  lastName: 'Doe'
});
collection.add(jane); // No need for the type argument since we're passing a real model

console.log(john.spouse.fullName); // 'Jane Doe'
console.log(fido.owner.fullName); // 'John Doe'
console.log(fido.owner.spouse.fullName); // 'Jane Doe'
console.log(collection.person.length); // 2
console.log(collection.length); // 3

// The new person model will automatically be created and added to the collection if it doesn't exist
const dave = fido.set('owner', {
  id: 3,
  firstName: 'Dave',
  lastName: 'Jones'
});

console.log(fido.owner.fullName); // 'Dave Jones'
console.log(fido.ownerId); // 3
console.log(collection.person.length); // 3
console.log(collection.length); // 4

fido.set('owner', jane);
console.log(fido.owner.fullName); // 'Jane Doe'
```

### Relationships (TypeScript version)

```typescript
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

console.log(john.spouse.fullName); // 'Jane Doe'
console.log(fido.owner.fullName); // 'John Doe'
console.log(fido.owner.spouse.fullName); // 'Jane Doe'
console.log(collection.person.length); // 2
console.log(collection.length); // 3

fido.set('owner', {
  id: 3,
  firstName: 'Dave',
  lastName: 'Jones'
});

console.log(fido.owner.fullName); // 'Dave Jones'
console.log(fido.ownerId); // 3
console.log(collection.person.length); // 3
console.log(collection.length); // 4

fido.set('owner', jane);
console.log(fido.owner.fullName); // 'Jane Doe'
```

## Collection

* `constructor([serializedData])` - The constructor can be provided with the serialized data from `toJS` in order to deserialize
* `static types` - Array of classes extended from the Model
* `length` - Number of unique models in the collection
* `add(model, [type])` - Add a model (or an array of models). Type param is required if the first argument is an plain object (or an array of plain objects) and you want to map them to the correct model classes
* `find(type, [id])` - Find a specific model
* `findAll(type)` - Find all models of the specified type
* `remove(type, [id])` - Remove a specific model
* `removeAll(type)` - Remove all models of the specified type
* `toJS()` - Convert the collection (and containing models) into a plain JS Object in order to be serialized

## Model

* `constructor([serializedData])` - The constructor can be provided with the serialized data from `toJS` in order to deserialize
* `__id` - ID of the model
* `static.idAttribute` - Property name of the unique identifier in your data (default is `id`)
* `static.type` - Type of the model
* `update(data)` - Update the model with new data (object)
* `set(prop, value)` - Set a property to the specified value
* `toJS()` - Convert the model into a plain JS Object in order to be serialized

## TODO

* [ ] Autoincrement IDs
* [ ] More tests
* [ ] Setup test code coverage
* [ ] Better docs
* [ ] Basic reference validation (throw an error if the wrong model type was assigned)