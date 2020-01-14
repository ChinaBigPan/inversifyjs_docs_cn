---
title: 循环依赖
sidebarDepth: 2
---

# 循环依赖

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/circular_dependencies.md)

## 模块的循环依赖(ES6、CommonJS等等)

如果两个模块存在循环依赖关系，并且使用了`@inject(SomeClass)`进行注释。那么在运行时，一个模块将在另一个模块之前被解析，此时装饰器会在`@inject(SomeClass)  SomeClass还处于undefined状态`被调用。这时InversifyJS会抛出下面这个异常：

> @inject called with undefined this could mean that the class ${name} has a circular dependency problem. You can use a LazyServiceIdentifer to overcome this limitation.

有两种方法能够摆脱这种限制：

- 使用`LazyServiceIdentifer`。惰性标识符并不会推迟依赖的注入，所有依赖在类实例创建时已经注入了。其实，它所推迟是对属性标识符的访问(从而解决模块问题)。这方面的示例可以从我们的[单元测试](https://github.com/krzkaczor/InversifyJS/blob/a53bf2cbee65803b197998c1df496c3be84731d9/test/inversify.test.ts#L236-L300)中找到。

- 使用`@lazyInject`装饰器。该装饰器是`inversify-inject-decorators`模块的一部分。`@lazyInject`装饰器会在依赖被实际应用前推迟其注入，该过程在类的实例被创建前发生。

## 依赖关系图(类)中的循环依赖关系

InversifyJS能够识别循环依赖。如果检测到循环依赖，它会抛出一个异常来帮助你识别问题的位置:

```ts
Error: Circular dependency found: Ninja -> A -> B -> C -> D -> A
```
