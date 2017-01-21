import {Model, Collection} from '../src';
import {computed} from 'mobx';

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

fido.assign('owner', {
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