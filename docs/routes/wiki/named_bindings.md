---
title: 具名绑定
sidebarDepth: 2
---

# 具名绑定

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/named_bindings.md)

::: tip
具名绑定和带标签绑定类似
:::

我们可以通过具名绑定来修复`AMBIGUOUS_MATCH`错误。该错误的产生原因是：两个以上的具体类被绑定到一个抽象。注意`Ninja`类的构造函数参数是如何使用`@named`装饰器修饰的：

```ts
interface Weapon {}

@injectable()
class Katana implements Weapon {}

@injectable()
class Shuriken implements Weapon {}

interface Ninja {
    katana: Weapon;
    shuriken: Weapon;
}

@injectable()
class Ninja implements Ninja {
    public katana: Weapon;
    public shuriken: Weapon;
    public constructor(
        @inject("Weapon") @named("strong") katana: Weapon,
        @inject("Weapon") @named("weak") shuriken: Weapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

我们将`Katana`和`Shuriken`绑定到了`Weapon`，同时添加了`whenTargetNamed`约束条件来避免产生`AMBIGUOUS_MATCH`错误:

```ts
container.bind<Ninja>("Ninja").to(Ninja);
container.bind<Weapon>("Weapon").to(Katana).whenTargetNamed("strong");
container.bind<Weapon>("Weapon").to(Shuriken).whenTargetNamed("weak");
```