---
title: 控制依赖项的作用域
sidebarDepth: 2
---

# 控制依赖项的作用域

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/scope.md)

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

它包括下面这些绑定类型：

```ts
interface BindingToSyntax<T> {
    toConstructor<T2>(constructor: Newable<T2>): BindingWhenOnSyntax<T>;
    toFactory<T2>(factory: FactoryCreator<T2>): BindingWhenOnSyntax<T>;
    toFunction(func: T): BindingWhenOnSyntax<T>;
    toAutoFactory<T2>(serviceIdentifier: ServiceIdentifier<T2>): BindingWhenOnSyntax<T>;
    toProvider<T2>(provider: ProviderCreator<T2>): BindingWhenOnSyntax<T>;
}
```

我们无法选择该绑定类型的作用域，因为被注入的值（工厂函数）总是一个单例。然而，工厂方法内部的实现可以选择是否返回一个单例。

举个例子，以下面这种方式注入的工厂方法就是一个单例：

```ts
container.bind<interfaces.Factory<Katana>>("Factory<Katana>").toAutoFactory<Katana>("Katana");
```

不过，工厂方法的返回值就不一定是一个单例了。

```ts
container.bind<Katana>("Katana").to(Katana).inTransientScope();
// 或
container.bind<Katana>("Katana").to(Katana).inSingletonScope();
```

## 关于`inRequestScope`

当我们使用inRequestScope的时候，实际上使用的是一个特别的单例。

- `inSingletonScope`创建的是覆盖类型绑定完整生命周期的单例。这意味着当我们使用`container.unbind`取消类型绑定时，`inSingletonScope`会在内存中清除。
- `inRequestScope`创建的单例覆盖的是调用`container.get`、`container.getTagged`或`container.getNamed`时的完整生命周期。对这些方法的每一次调用都将解析一个根依赖项及其所有子依赖项。InversifyJS 在内部创建了一个名为“解析方案”的依赖关系图。`inRequestScope`作用域会对其中多次出现的对象使用单个实例。这样就减少了所需的解析数，并且在某些情况下可以用作**性能优化**的选项。

