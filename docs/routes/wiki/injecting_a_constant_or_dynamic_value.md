---
title: 注入一个固定/动态值
---

# 注入一个固定/动态值

将抽象绑定为固定值：

```ts
container.bind<Katana>("Katana").toConstantValue(new Katana());
```

将抽象绑定为动态值：

```ts
container.bind<Katana>("Katana").toDynamicValue((context: interfaces.Context) => { return new Katana(); });
```