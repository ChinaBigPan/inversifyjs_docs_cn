---
title: 自动生成工厂方法
sidebarDepth: 2
---

# 自动生成工厂方法

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/auto_factory.md)

将抽象类绑定到自动生成的工厂方法

```ts
@injectable()
class Ninja implements Ninja {

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(
	    @inject("Factory<Katana>") katanaFactory: interfaces.Factory<Katana>,
	    @inject("Shuriken") shuriken: Shuriken
    ) {
        this._katana = katanaFactory();
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

```ts
container.bind<Katana>("Katana").to(Katana);

container.bind<interfaces.Factory<Katana>>("Factory<Katana>")
	  .toAutoFactory<Katana>("Katana");
```
