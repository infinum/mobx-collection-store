# mobx-collection-store

Structured data store for MobX. Partially influenced by [Backbone Collections](http://backbonejs.org/#Collection).

**Using [JSON API](http://jsonapi.org/)?** Check out [mobx-jsonapi-store](https://github.com/infinum/mobx-jsonapi-store) - All mobx-collection-store features, and JSON API helpers in one place.

***

[![Build Status](https://travis-ci.org/infinum/mobx-collection-store.svg?branch=master)](https://travis-ci.org/infinum/mobx-collection-store)
[![Test Coverage](https://codeclimate.com/github/infinum/mobx-collection-store/badges/coverage.svg)](https://codeclimate.com/github/infinum/mobx-collection-store/coverage)
[![npm version](https://badge.fury.io/js/mobx-collection-store.svg)](https://badge.fury.io/js/mobx-collection-store)

[![Dependency Status](https://david-dm.org/infinum/mobx-collection-store.svg)](https://david-dm.org/infinum/mobx-collection-store)
[![devDependency Status](https://david-dm.org/infinum/mobx-collection-store/dev-status.svg)](https://david-dm.org/infinum/mobx-collection-store#info=devDependencies)
[![Greenkeeper badge](https://badges.greenkeeper.io/infinum/mobx-collection-store.svg)](https://greenkeeper.io/)

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

john.lastName = 'Williams';
console.log(john.lastName); // 'Williams'
```

For more advanced use-cases, check out the [getting started](https://github.com/infinum/mobx-collection-store/wiki/Getting-started) guide, or the [examples](examples) folder.

## Installation

To install, use `npm` or `yarn`. The lib has a peer dependency of `mobx` 2.7.0 or later (including MobX 3).

```bash
npm install mobx-collection-store mobx --save
```

```bash
yarn add mobx-collection-store mobx
```

Since the lib is exposed as a set of CommonJS modules, you'll need something like [webpack](https://webpack.js.org/) or browserify in order to use it in the browser.

Don't forget to [prepare your code for production](https://webpack.js.org/guides/production/) for better performance!

## [Getting started](https://github.com/infinum/mobx-collection-store/wiki/Getting-started)

## [API reference](https://github.com/infinum/mobx-collection-store/wiki/API-reference)

## License

The MIT License

![](https://assets.infinum.co/assets/brand-logo-9e079bfa1875e17c8c1f71d1fee49cf0.svg) © 2016 Infinum Inc.
