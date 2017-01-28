import {computed} from 'mobx';

import {Collection, Model} from '../src';

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
const dave = fido.assign('owner', {
  id: 3,
  firstName: 'Dave',
  lastName: 'Jones'
});

console.log(fido.owner.fullName); // 'Dave Jones'
console.log(fido.ownerId); // 3
console.log(collection.person.length); // 3
console.log(collection.length); // 4

fido.owner = jane;
console.log(fido.owner.fullName); // 'Jane Doe'