import {extendObservable} from 'mobx';

import {Collection, Model} from '../src';

// tslint:disable:max-classes-per-file
// tslint:disable:no-console

class User extends Model {
  public static type = 'user';

  public name: string;
}
class Order extends Model {
  public static type = 'order';
  public static refs = {user: 'user', items: 'orderItem'};

  // Handle the differences between your data and the API
  public static preprocessor(data: {id: number, userId: number, order_items: Array<Object>}) {
    return {
      id: data.id,
      items: data.order_items,
      user: data.userId,
    };
  }

  public id: number;
  public items: OrderItem|Array<OrderItem>;
  public user: User|Array<User>;
}

class OrderItem extends Model {
  public static type = 'orderItem';
  public static refs = {product: 'product'};
}

class Product extends Model {
  public static type = 'product';
}

class Webshop extends Collection {
  public static types = [User, Order, OrderItem, Product];

  public orderItem: Array<OrderItem>;
  public product: Array<Product>;
}

const webshop = new Webshop();

const user = webshop.add<User>({id: 1, name: 'John'}, 'user');

// E.g. from an API call
const data = {
  id: 1,
  order_items: [{
    id: 1,
    product: {
      id: 1,
      name: 'Domain',
      price: 9.99,
    },
    quantity: 2,
  }, {
    id: 2,
    product: {
      id: 2,
      name: 'Hosting',
      price: 19.99,
    },
    quantity: 1,
  }, {
    id: 3,
    product: {
      id: 1,
      name: 'Domain',
      price: 9.99,
    },
    quantity: 1,
  }],
  userId: 1,
};

// Reminder - the add method can also handle an array of items
const order = webshop.add<Order>(data, 'order');
console.log(order.id); // 1
console.log(Array.isArray(order.items) && order.items.length); // 3
console.log(!Array.isArray(order.user) && order.user.name); // 'John'

console.log(webshop.orderItem.length); // 3
console.log(webshop.product.length); // 2
