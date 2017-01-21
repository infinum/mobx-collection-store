# mobx-collection-store

[![npm version](https://badge.fury.io/js/mobx-collection-store.svg)](https://badge.fury.io/js/mobx-collection-store)
[![Build Status](https://travis-ci.org/infinum/mobx-collection-store.svg?branch=master)](https://travis-ci.org/infinum/mobx-collection-store)
[![Dependency Status](https://david-dm.org/infinum/mobx-collection-store.svg)](https://david-dm.org/infinum/mobx-collection-store)
[![devDependency Status](https://david-dm.org/infinum/mobx-collection-store/dev-status.svg)](https://david-dm.org/infinum/mobx-collection-store#info=devDependencies)

Data store for MobX. Influenced by [Backbone Collections](http://backbonejs.org/#Collection) and [mobx-jsonapi-store](https://github.com/infinum/mobx-jsonapi-store).

## [Basic usage](examples/basic.js)

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

john.lastName = 'Williams';
console.log(john.lastName); // 'Williams'
```
## Installation

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

* [JavaScript version](examples/relationships.js)
* [TypeScript version](examples/relationships.ts)

## Collection

* `constructor([serializedData])` - The constructor can be provided with the serialized data from `toJS` in order to deserialize
* `static types` - Array of classes extended from the Model
* `length` - Number of unique models in the collection
* `add(model, [type])` - Add a model (or an array of models). Type param is required if the first argument is an plain object (or an array of plain objects) and you want to map them to the correct model classes
* `find(type, [id])` - Find a specific model
* `findAll(type)` - Find all models of the specified type
* `remove(type, [id])` - Remove a specific model
* `removeAll(type)` - Remove all models of the specified type
* `reset()` - Remove all models from the collection
* `toJS()` - Convert the collection (and containing models) into a plain JS Object in order to be serialized

## Model

* `constructor([serializedData])` - The constructor can be provided with the serialized data from `toJS` in order to deserialize
* `static idAttribute` - Property name of the unique identifier in your data (default is `id`)
* `static type` - Type of the model
* `static typeAttribute` - Name of the type attribute if dynamic types are used (`static type` is not set)
* `static defaults` - An object with default model properties
* `static enableAutoId` - Should the id be generated if it doesn't exist (default `true`)
* `static autoIdFunction` - Function used to generate a model id (default is creating an autoincrement id)
* `update(data)` - Update the model with new data (object)
* `assign(prop, value)` - Set a property to the specified value
* `assignRef(prop, value, [type])` - Add a new reference to the model
* `toJS()` - Convert the model into a plain JS Object in order to be serialized

*Note:* New properties should be added to the model by using the `assign` or `assignRef` methods, not by direct assignment.

## License

The MIT License

![](https://assets.infinum.co/assets/brand-logo-9e079bfa1875e17c8c1f71d1fee49cf0.svg) © 2016 Infinum Inc.