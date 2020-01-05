---
title: 默认target
---

# whenTargetIsDefault

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/default_targets.md)

当传入的服务标识符具有多个绑定时，我们可以使用下面的方法来处理潜在的`AMBIGUOUS_MATCH`错误：

- 具名绑定(Named bindings)
- 带标签的绑定(Tagged bindings)
- 上下文绑定(Contextual bindings)
- 默认target

这一节里我们将解释如何使用默认target。

之前我们介绍过的具名绑定和带标签的绑定都是在每个单一注入中使用`@named("strong")`/`@named("weak")`或`@tagged("strong", true)`/`@tagged("strong", false)`等装饰器。

默认target是一个更好的解决方案：

```ts
container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed(TAG.throwable);
container.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetIsDefault();
```

当绑定没有被`@named`或`@tagged`装饰器修饰的时候，我们可以使用`whenTargetIsDefault`来设置绑定的默认target来解决潜在的`AMBIGUOUS_MATCH`问题。

```ts
let TYPES = {
    Weapon: "Weapon"
};

let TAG = {
    throwable: "throwable"
};

interface Weapon {
    name: string;
}

@injectable()
class Katana implements Weapon {
    public name: string;
    public constructor() {
        this.name = "Katana";
    }
}

@injectable()
class Shuriken implements Weapon {
    public name: string;
    public constructor() {
        this.name = "Shuriken";
    }
}

let container = new Container();
container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed(TAG.throwable);
container.bind<Weapon>(TYPES.Weapon).to(Katana).whenTargetIsDefault();

let defaultWeapon = container.get<Weapon>(TYPES.Weapon);
let throwableWeapon = container.getNamed<Weapon>(TYPES.Weapon, TAG.throwable);

expect(defaultWeapon.name).eql("Katana");
expect(throwableWeapon.name).eql("Shuriken");
```

