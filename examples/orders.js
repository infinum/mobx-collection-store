import {extendObservable} from 'mobx';

import {Collection, Model} from '../src';

class User extends Model {}
User.type = 'user';

class Order extends Model {}
Order.type = 'order';
Order.refs = {user: 'user', items: 'orderItem'};

// Handle the differences between your data and the API
Order.preprocess = function(data) {
  return {
    id: data.id,
    user: data.userId,
    items: data.order_items
  };
}

class OrderItem extends Model {}
OrderItem.type = 'orderItem';
OrderItem.refs = {product: 'product'};

class Product extends Model {}
Product.type = 'product';

class Webshop extends Collection {}
Webshop.types = [User, Order, OrderItem, Product];

const webshop = new Webshop();

const user = webshop.add({id: 1, name: 'John'}, 'user');

// E.g. from an API call
const data = {
  id: 1,
  userId: 1,
  order_items: [{
    id: 1,
    quantity: 2,
    product: {
      id: 1,
      name: 'Domain',
      price: 9.99
    }
  }, {
    id: 2,
    quantity: 1,
    product: {
      id: 2,
      name: 'Hosting',
      price: 19.99
    }
  }, {
    id: 3,
    quantity: 1,
    product: {
      id: 1,
      name: 'Domain',
      price: 9.99
    }
  }]
};

// Reminder - the add method can also handle an array of items
const order = webshop.add(data, 'order');
console.log(order.id); // 1
console.log(order.items.length); // 3
console.log(order.user.name); // 'John'

console.log(webshop.orderItem.length); // 3
console.log(webshop.product.length); // 2