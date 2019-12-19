---
title: 控制依赖项的模式
---

# 控制依赖项的模式

InversifyJS 默认使用 `瞬态(transient)`模式，但您仍旧可以使用`单例(singleton)`或`请求(request)`作用域模式。

```ts
container.bind<Shuriken>("Shuriken").to(Shuriken).inTransientScope(); // 默认
container.bind<Shuriken>("Shuriken").to(Shuriken).inSingletonScope();
container.bind<Shuriken>("Shuriken").to(Shuriken).inRequestScope();
```

## 关于`inSingletonScope`

此类绑定的可用类型很多：

```ts
interface BindingToSyntax<T> {
    to(constructor: { new (...args: any[]): T; }): BindingInWhenOnSyntax<T>;
    toSelf(): BindingInWhenOnSyntax<T>;
    toConstantValue(value: T): BindingWhenOnSyntax<T>;
    toDynamicValue(func: (context: Context) => T): BindingWhenOnSyntax<T>;
    toConstructor<T2>(constructor: Newable<T2>): BindingWhenOnSyntax<T>;
    toFactory<T2>(factory: FactoryCreator<T2>): BindingWhenOnSyntax<T>;
    toFunction(func: T): BindingWhenOnSyntax<T>;
    toAutoFactory<T2>(serviceIdentifier: ServiceIdentifier<T2>): BindingWhenOnSyntax<T>;
    toProvider<T2>(provider: ProviderCreator<T2>): BindingWhenOnSyntax<T>;
}
```

就作用域的行为而言，我们可以将这些类型的绑定分为两组：

- 注入`对象`的绑定
- 注入`函数`的绑定

### 注入`对象`的绑定

它包括下面这些绑定类型：

```ts
interface BindingToSyntax<T> {
    to(constructor: { new (...args: any[]): T; }): BindingInWhenOnSyntax<T>;
    toSelf(): BindingInWhenOnSyntax<T>;
    toConstantValue(value: T): BindingWhenOnSyntax<T>;
    toDynamicValue(func: (context: Context) => T): BindingInWhenOnSyntax<T>;
}
```

默认使用的是`inTransientScope`，我们可以选择绑定类型的作用域。`toConstantValue`除外，它固定使用`inSingletonScope`。




