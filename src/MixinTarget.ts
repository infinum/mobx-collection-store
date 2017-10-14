function assignMixin(target: MixinTarget, Mixin: typeof MixinTarget) {
  const mixin = new Mixin();
  for (const prop in mixin) {
    if (!(prop in target)) {
      target[prop] = mixin[prop];
    }
  }
}

export class MixinTarget {
  get static(): typeof MixinTarget {
    return this.constructor as typeof MixinTarget;
  }

  public static mixins: Array<typeof MixinTarget> = [];

  constructor() {
    this.static.mixins.map((Mix) => assignMixin(this, Mix));
  }
}
