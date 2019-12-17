---
title: 基础
---

让我们来看看 InversifyJS 在 TypeScript 下的一些基本示例：

## 第一步：声明您的接口和类型

我们的目的是让开发者的代码能够遵循[依赖倒置](https://en.wikipedia.org/wiki/Dependency_inversion_principle)。这意味着我们应当“化具体为抽象”。首先我们应该声明一些(抽象)接口

```ts
// 文件📃 interfaces.ts

export interface Warrior {
    fight(): string;
    sneak(): string;
}

export interface Weapon {
    hit(): string;
}

export interface ThrowableWeapon {
    throw(): string;
}
```

InversifyJS 需要在运行时(runtime)使用这些类型(type)作为标识符。这里我们使用了Symbol，但您也可以使用类或字符串。

```ts
// 文件📃 types.ts

const TYPES = {
    Warrior: Symbol.for("Warrior"),
    Weapon: Symbol.for("Weapon"),
    ThrowableWeapon: Symbol.for("ThrowableWeapon")
};

export { TYPES };
```

> **注意**：我们虽然推荐使用 Symbol 不过 InversifyJS 也是支持类和字符串的。

## 第二步：用 @injectable 和 @inject 装饰器声明依赖



