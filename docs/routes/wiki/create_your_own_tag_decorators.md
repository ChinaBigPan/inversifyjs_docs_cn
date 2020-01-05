---
title: 自定义标签装饰器
sidebarDepth: 2
---

# 自定义标签装饰器

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/custom_tag_decorators.md)

创建你自己的装饰器很简单：

```ts
let throwable = tagged("canThrow", true);
let notThrowable = tagged("canThrow", false);

@injectable()
class Ninja implements Ninja {
    public katana: Weapon;
    public shuriken: Weapon;
    public constructor(
        @inject("Weapon") @notThrowable katana: Weapon,
        @inject("Weapon") @throwable shuriken: Weapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```