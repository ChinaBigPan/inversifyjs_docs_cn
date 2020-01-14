---
title: 分层次依赖注入
---

# 支持分层次依赖注入

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/hierarchical_di.md)

一些应用采用了分层次依赖注入(DI)系统。举例来说，这是Angular 2.0自带的[分层DI系统](https://angular.io/docs/ts/latest/guide/hierarchical-dependency-injection.html)。

在分层DI系统中，一个父容器可以拥有多个子容器。这些容器共同构成了分层架构。

当位于分层架构底部的其中一个容器请求一个依赖的时候，容器将会立足于该依赖只作用于其自身的绑定。如果容器泄露了绑定，那么它会将请求向上传递到父容器。通用如果该容器不能满足请求，那么将继续传递至上一层的父容器。请求会逐级冒泡，直至我们找到一个能够处理请求的容器，或是所有的祖先容器都不满足需求。

```ts
let weaponIdentifier = "Weapon";

@injectable()
class Katana {}
 
let parentContainer = new Container();
parentContainer.bind(weaponIdentifier).to(Katana);
 
let childContainer = new Container();
childContainer.parent = parentContainer;

expect(childContainer.get(weaponIdentifier)).to.be.instanceOf(Katana); // true
```