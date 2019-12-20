---
title: 控制依赖项的作用域
---

# 控制依赖项的作用域

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

当我们首次调用`container.get`方法，以及使用`to`、`toSelf`或`toDynamicValue`时，InversifyJS容器将尝试使用构造器或动态值工厂方法来生成对象实例或值。如果作用域设置为`inSingletonScope`，那么值会被缓存。当我们再次调用`container.get`方法来查询同一个ID时，如果已经是`inSingletonScope`，则Inversify 将会从缓存中读取值。

请注意，类可以具有一些依赖项，而动态值可以通过当前上下文访问其他类型。这些依赖可能是也可能不是独立于它们各自的组合树中的父对象所选作用域的单例。

### 注入`函数`的绑定


