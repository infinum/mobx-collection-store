export function mapItems<T>(data: Object|Array<Object>, fn: Function): T|Array<T> {
  return data instanceof Array ? data.map((item) => fn(item)) : fn(data);
}

export function first(arr: Array<any>): any {
  return arr.length > 0 ? arr[0] : null;
}