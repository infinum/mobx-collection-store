import {computed} from 'mobx';

import {Collection, Model} from '../src';

// tslint:disable:max-classes-per-file
// tslint:disable:no-console

class Person extends Model {
  public static type = 'person';
  public static refs = {spouse: 'person', pets: {model: 'pet', property: 'owner'}};

  public firstName: string;
  public lastName: string;
  public spouse: Person;
  public pets: Array<Pet>;

  @computed public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

class Pet extends Model {
  public static type = 'pet';
  public static refs = {owner: 'person'};

  public owner: Person;
  public ownerId: number;
  public name: string;
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

console.log(john.spouse.fullName); // 'Jane Doe'
console.log(john.pets[0].name); // 'Fido'
console.log(fido.owner.fullName); // 'John Doe'
console.log(fido.owner.spouse.fullName); // 'Jane Doe'
console.log(collection.person.length); // 2
console.log(collection.length); // 3

fido.assign('owner', {
  firstName: 'Dave',
  id: 3,
  lastName: 'Jones',
});

console.log(fido.owner.fullName); // 'Dave Jones'
console.log(fido.ownerId); // 3
console.log(collection.person.length); // 3
console.log(collection.length); // 4

fido.owner = jane;
console.log(fido.owner.fullName); // 'Jane Doe'
