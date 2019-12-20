---
title: 注入一个类构造器
---

# 注入一个类构造器

InversifyJS 支持构造函数的注入，允许在创建注入对象时传递抽象或具体类的实例。

对于抽象类(接口)，您需要使用`@inject`装饰器进行修饰。这一步必不可少，因为抽象的元数据在运行时是不可用的:

```ts
@injectable()
class Ninja implements Ninja {

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(
	    @inject("Newable<Katana>") Katana: interfaces.Newable<Katana>, 
	    @inject("Shuriken") shuriken: Shuriken
	) {
        this._katana = new Katana();
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

```ts
container.bind<interfaces.Newable<Katana>>("Newable<Katana>").toConstructor<Katana>(Katana);
```

对于具体的注入，您可以像往常一样简单地定义构造函数参数，而无需使用`@inject`修饰符。

InversifyJS 还支持 TypeScript 的构造函数赋值，所以你可以在参数中加入私有(private)或受保护(protested)的访问修饰符，容器注入依赖也不会有问题:

```ts
@injectable()
class Ninja implements Ninja {

    public constructor(private _dagger:Dagger) {

    }

    public throwDagger() {
        this._dagger.throw();
    }
}
```

```ts
container.bind<Dagger>(Dagger).toSelf()
```

