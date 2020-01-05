---
title: 注入工厂方法
sidebarDepth: 2
---

# 注入工厂方法

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/factory_injection.md) 

绑定一个抽象类至用户定义的工厂方法：

```ts
@injectable()
class Ninja implements Ninja {

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(
	    @inject("Factory<Katana>") katanaFactory: () => Katana, 
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
container.bind<interfaces.Factory<Katana>>("Factory<Katana>").toFactory<Katana>((context: interfaces.Context) => {
    return () => {
        return context.container.get<Katana>("Katana");
    };
});
```

您还可以定义带有参数的工厂方法：

```ts
container.bind<interfaces.Factory<Weapon>>("Factory<Weapon>").toFactory<Weapon>((context: interfaces.Context) => {
    return (throwable: boolean) => {
        if (throwable) {
            return context.container.getTagged<Weapon>("Weapon", "throwable", true);
        } else {
            return context.container.getTagged<Weapon>("Weapon", "throwable", false);
        }
    };
});
```

有时你可能需要在执行的过程中将参数传递给工厂方法：

```ts
container.bind<Engine>("Engine").to(PetrolEngine).whenTargetNamed("petrol");
container.bind<Engine>("Engine").to(DieselEngine).whenTargetNamed("diesel");

container.bind<interfaces.Factory<Engine>>("Factory<Engine>").toFactory<Engine>((context) => {
    return (named: string) => (displacement: number) => {
        let engine = context.container.getNamed<Engine>("Engine", named);
        engine.displacement = displacement;
        return engine;
    };
});

@injectable()
class DieselCarFactory implements CarFactory {
    private _dieselFactory: (displacement: number) => Engine ;
    constructor(
        @inject("Factory<Engine>") factory: (category: string) => (displacement: number) => Engine // Injecting an engine factory
    ) {
        this._dieselFactory = factory("diesel"); // Creating a diesel engine factory
    }
    public createEngine(displacement: number): Engine {
        return this._dieselFactory(displacement); // Creating a concrete diesel engine
    }
}
```


