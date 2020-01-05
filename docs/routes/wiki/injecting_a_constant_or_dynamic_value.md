---
title: 注入固定/动态值
sidebarDepth: 2
---

# 注入固定/动态值

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/value_injection.md)

将抽象绑定为固定值：

```ts
container.bind<Katana>("Katana").toConstantValue(new Katana());
```

将抽象绑定为动态值：

```ts
container.bind<Katana>("Katana").toDynamicValue((context: interfaces.Context) => { return new Katana(); });
```