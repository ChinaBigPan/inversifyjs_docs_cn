---
title: 带标签的绑定
sidebarDepth: 2
---

# 带标签的绑定

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/tagged_bindings.md)

我们可以通过为绑定设置标签来修复`AMBIGUOUS_MATCH`错误。该错误的产生原因是：两个以上的具体类被绑定到一个抽象。注意`Ninja`类的构造函数参数是如何使用`@tagged`装饰器修饰的：

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
        @inject("Weapon") @tagged("canThrow", false) katana: Weapon,
        @inject("Weapon") @tagged("canThrow", true) shuriken: Weapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

我们将`Katana`和`Shuriken`绑定到了`Weapon`，同时添加了`whenTargetTagged`约束条件来避免出现`AMBIGUOUS_MATCH`错误:

```ts
container.bind<Ninja>(ninjaId).to(Ninja);
container.bind<Weapon>(weaponId).to(Katana).whenTargetTagged("canThrow", false);
container.bind<Weapon>(weaponId).to(Shuriken).whenTargetTagged("canThrow", true);
```
