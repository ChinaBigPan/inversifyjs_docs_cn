---
title: 上下文绑定
sidebarDepth: 2
---

# 上下文绑定 & @targetName

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/contextual_bindings.md)

`@targetName`装饰器用于从上下文约束情况下访问构造函数参数的名称，即便代码被压缩也依旧可用。`constructor(katana, shuriken) { ...`在压缩后会变成`constructor(a, b) { ...`不过多亏了`@targetName`我们仍然可以在运行时引用之前的名称`katana`和`shuriken`。

```ts
interface Weapon {}

@injectable()
class Katana implements Weapon {}

@injectable()
class Shuriken implements Weapon {}

interface Ninja {
    katana: Weapon;
    shuriken: Weapon;
}

@injectable()
class Ninja implements Ninja {
    public katana: Weapon;
    public shuriken: Weapon;
    public constructor(
        @inject("Weapon") @targetName("katana") katana: Weapon,
        @inject("Weapon") @targetName("shuriken") shuriken: Weapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

我们将`Katana`和`Shuriken`绑定到`Weapon`，同时通过`when`来添加自定义的约束条件以避免`AMBIGUOUS_MATCH`错误：

```ts
container.bind<Ninja>(ninjaId).to(Ninja);

container.bind<Weapon>("Weapon").to(Katana).when((request: interfaces.Request) => {
    return request.target.name.equals("katana");
});

container.bind<Weapon>("Weapon").to(Shuriken).when((request: interfaces.Request) => {
    return request.target.name.equals("shuriken");
});
```

target字段部署`IQueryableString`接口以帮助您创建你的自定义约束条件：

```ts
interface QueryableString {
	 startsWith(searchString: string): boolean;
	 endsWith(searchString: string): boolean;
	 contains(searchString: string): boolean;
	 equals(compareString: string): boolean;
	 value(): string;
}
```

我们提供了一些辅助方法来帮助您创建自定义约束：

```ts
import { Container, traverseAncerstors, taggedConstraint, namedConstraint, typeConstraint } from "inversify";

let whenParentNamedCanThrowConstraint = (request: interfaces.Request) => {
    return namedConstraint("canThrow")(request.parentRequest);
};

let whenAnyAncestorIsConstraint = (request: interfaces.Request) => {
    return traverseAncerstors(request, typeConstraint(Ninja));
};

let whenAnyAncestorTaggedConstraint = (request: interfaces.Request) => {
    return traverseAncerstors(request, taggedConstraint("canThrow")(true));
};
```

InversifyJS自带的绑定语法包括了一些已经实现的常见的上下文约束：

```ts
interface BindingWhenSyntax<T> {
    when(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnSyntax<T>;
    whenTargetNamed(name: string): interfaces.BindingOnSyntax<T>;
    whenTargetTagged(tag: string, value: any): interfaces.BindingOnSyntax<T>;
    whenInjectedInto(parent: (Function|string)): interfaces.BindingOnSyntax<T>;
    whenParentNamed(name: string): interfaces.BindingOnSyntax<T>;
    whenParentTagged(tag: string, value: any): interfaces.BindingOnSyntax<T>;
    whenAnyAncestorIs(ancestor: (Function|string)): interfaces.BindingOnSyntax<T>;
    whenNoAncestorIs(ancestor: (Function|string)): interfaces.BindingOnSyntax<T>;
    whenAnyAncestorNamed(name: string): interfaces.BindingOnSyntax<T>;
    whenAnyAncestorTagged(tag: string, value: any): interfaces.BindingOnSyntax<T>;
    whenNoAncestorNamed(name: string): interfaces.BindingOnSyntax<T>;
    whenNoAncestorTagged(tag: string, value: any): interfaces.BindingOnSyntax<T>;
    whenAnyAncestorMatches(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnSyntax<T>;
    whenNoAncestorMatches(constraint: (request: interfaces.Request) => boolean): interfaces.BindingOnSyntax<T>;
}
```
