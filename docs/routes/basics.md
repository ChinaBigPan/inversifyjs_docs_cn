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

让我们继续声明一些(具体)类。这些类是我们刚才所声明的接口的实现。所有的类都必须使用 @injectable 装饰器修饰。

当一个类依赖于依赖接口时，我们还需要使用 @inject 装饰器来定义一个在运行时可用的接口标识符。在这个例子中，我们使用了`Symbol.for('weapon')`和`Symbol.for('ThrowableWeapon')`作为运行时标识符

```ts
// 文件📃 entities.ts

@injectable()
class Katana implements Weapon {
    public hit() {
        return "cut!";
    }
}

@injectable()
class Shuriken implements ThrowableWeapon {
    public throw() {
        return "hit!";
    }
}

@injectable()
class Ninja implements Warrior {

    private _katana: Weapon;
    private _shuriken: ThrowableWeapon;

    public constructor(
	    @inject(TYPES.Weapon) katana: Weapon,
	    @inject(TYPES.ThrowableWeapon) shuriken: ThrowableWeapon
    ) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); }
    public sneak() { return this._shuriken.throw(); }

}

export { Ninja, Katana, Shuriken };
```

如果觉得还不错，您可以使用属性注入来代替构造函数注入，这样您就不必声明类构造函数了：

```ts
@injectable()
class Ninja implements Warrior {
    @inject(TYPES.Weapon) private _katana: Weapon;
    @inject(TYPES.ThrowableWeapon) private _shuriken: ThrowableWeapon;
    public fight() { return this._katana.hit(); }
    public sneak() { return this._shuriken.throw(); }
}
```

## 第三步：创建并配置一个容器

这里我们建议在一个名为`inversify.config.ts`中执行该操作。这是唯一存在耦合的地方。在应用的其他部分中，不应该再存在任何对其他类的引用了。

```ts
// 文件📃 inversify.config.ts

import { Container } from "inversify";
import { TYPES } from "./types";
import { Warrior, Weapon, ThrowableWeapon } from "./interfaces";
import { Ninja, Katana, Shuriken } from "./entities";

const myContainer = new Container();
myContainer.bind<Warrior>(TYPES.Warrior).to(Ninja);
myContainer.bind<Weapon>(TYPES.Weapon).to(Katana);
myContainer.bind<ThrowableWeapon>(TYPES.ThrowableWeapon).to(Shuriken);

export { myContainer };
```

## 第四步：处理依赖关系

您可以使用容器类中的泛型方法 `get<T>` 来处理依赖关系。请注意，您应该仅在[合成根](https://blog.ploeh.dk/2011/07/28/CompositionRoot/)中执行此类操作，从而避免[服务定位器模式反转](https://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/)

```ts
import { myContainer } from "./inversify.config";
import { TYPES } from "./types";
import { Warrior } from "./interfaces";

const ninja = myContainer.get<Warrior>(TYPES.Warrior);

expect(ninja.fight()).eql("cut!"); // true
expect(ninja.sneak()).eql("hit!"); // true
```

于是我们就能够看到`katana(太刀)`和`shuriken(手里剑)`成功注入到`Ninja(忍者)`这个类当中了。

InversifyJS 支持 ES5 和 ES6 并且并不一定要在 TypeScript 环境中。[这里](https://github.com/inversify/InversifyJS/blob/master/wiki/basic_js_example.md)可以查看 JavaScript 的示例。


