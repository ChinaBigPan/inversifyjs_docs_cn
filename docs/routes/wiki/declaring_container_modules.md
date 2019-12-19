---
title: 声明容器模块
---

# 声明容器模块

在制作大型应用时，太多的绑定毫无疑问会提升项目的复杂度。容器模块化有助于管理众多的绑定。

## 同步容器模块

```ts
let warriors = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<Ninja>("Ninja").to(Ninja);
});

let weapons = new ContainerModule(
    (
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind
    ) => {
        bind<Katana>("Katana").to(Katana);
        bind<Shuriken>("Shuriken").to(Shuriken);
    }
);

let container = new Container();
container.load(warriors, weapons);
container.unload(warriors);
```

## 异步容器模块

```ts
let warriors = new AsyncContainerModule(async (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    const ninja = await getNinja();
    bind<Ninja>("Ninja").toConstantValue(ninja);
});

let weapons = new AsyncContainerModule(
    (
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind
    ) => {
        bind<Katana>("Katana").to(Katana);
        bind<Shuriken>("Shuriken").to(Shuriken);
    }
);

let container = new Container();
await container.loadAsync(warriors, weapons);
container.unload(warriors);
```