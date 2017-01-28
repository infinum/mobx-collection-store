# mobx-collection-store

[![npm version](https://badge.fury.io/js/mobx-collection-store.svg)](https://badge.fury.io/js/mobx-collection-store)

[![Build Status](https://travis-ci.org/infinum/mobx-collection-store.svg?branch=master)](https://travis-ci.org/infinum/mobx-collection-store)
[![Test Coverage](https://codeclimate.com/github/infinum/mobx-collection-store/badges/coverage.svg)](https://codeclimate.com/github/infinum/mobx-collection-store/coverage)

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

## [Docs](https://infinum.github.io/mobx-collection-store/index.html)

### [Collection](https://infinum.github.io/mobx-collection-store/classes/collection.html)

### [Model](https://infinum.github.io/mobx-collection-store/classes/model.html)

*Note:* New properties should be added to the model by using the `assign` or `assignRef` methods, not by direct assignment.

## License

The MIT License

![](https://assets.infinum.co/assets/brand-logo-9e079bfa1875e17c8c1f71d1fee49cf0.svg) © 2016 Infinum Inc.