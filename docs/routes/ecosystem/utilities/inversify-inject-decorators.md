# inversify-inject-decorators

[原文链接](https://github.com/inversify/inversify-inject-decorators)

延迟计算的属性注入装饰器

## 开发动机

有部分的框架和库接管了给定类的实例的创建。例如，React接管了React组件实例的创建。**这类框架和库阻止了我们使用构造函数来进行注入**，因此在和InversifyJS相集成时颇有难度。


InversifyJS虽然也提供了对属性注入的支持，但它同样需要InversifyJS创建类的实例。

本库中包含的装饰器允许您延迟注入属性，就算类的实例不是由InversifyJS创建的也没有问题。

这个库的作用就是让InversifyJS和其他任何接管类实例创建的库或框架能集成到一起。

## 安装

您可以使用npm来安装：

```bash
$ npm install inversify inversify-inject-decorators reflect-metadata --save
```

`inversify-inject-decorators`的类型定义已经包含至npm模块中，且需要TypeScript版本 > 2.0

> ⚠️请注意该库需要环境支持ES6 Symbol。您可以尝试使用[es6-symbol polyfill](https://www.npmjs.com/package/es6-symbol)

## 缓存与非缓存行为

默认情况下，由其所实现的延迟注入机制将把所有请求缓存到底层容器。这意味着服务标识符之间的重新绑定或取消绑定服务将不会反映在注入了这些服务的实例中。对于动态的加载/卸载容器模块，以及从容器中添加或删除绑定的场景来说也是如此。

为了突破这个限制，我们可以向getdecorator传递一个额外的布尔值参数`getDecorators(container: Container, doCache = true)`。若设置为`false`，从容器解析的服务将不会被缓存，每次将始终直接从容器解析，例如：

```ts
import { Container } from "inversify";
import getDecorators from "inversify-inject-decorators";

const container: Container = new Container();
const { lazyInject } = getDecorators(container, false);
```

## 使用`@lazyInject`进行基本属性的延迟注入

下面的例子演示了如何使用`@lazyInject`装饰器来注入属性:

```ts
import getDecorators from "inversify-inject-decorators";
import { Container, injectable, tagged, named } from "inversify";

let container = new Container();
let { lazyInject } = getDecorators(container);
let TYPES = { Weapon: "Weapon" };

interface Weapon {
    name: string;
    durability: number;
    use(): void;
}

@injectable()
class Sword implements Weapon {
    public name: string;
    public durability: number;
    public constructor() {
        this.durability = 100;
        this.name = "Sword";
    }
    public use() {
        this.durability = this.durability - 10;
    }
}

class Warrior {
    @lazyInject(TYPES.Weapon)
    public weapon: Weapon;
}

container.bind<Weapon>(TYPES.Weapon).to(Sword);

let warrior = new Warrior();
console.log(warrior.weapon instanceof Sword); // true
```

## 使用`@lazyInjectNamed`进行具名属性注入

下面的例子演示了如何使用`@lazyInjectNamed`装饰器来注入一个具名属性：

```ts
import getDecorators from "inversify-inject-decorators";
import { Container, injectable, named } from "inversify";

let container = new Container();
let { lazyInjectNamed } = getDecorators(container);
let TYPES = { Weapon: "Weapon" };

interface Weapon {
    name: string;
    durability: number;
    use(): void;
}

@injectable()
class Sword implements Weapon {
    public name: string;
    public durability: number;
    public constructor() {
        this.durability = 100;
        this.name = "Sword";
    }
    public use() {
        this.durability = this.durability - 10;
    }
}

@injectable()
class Shuriken implements Weapon {
    public name: string;
    public durability: number;
    public constructor() {
        this.durability = 100;
        this.name = "Shuriken";
    }
    public use() {
        this.durability = this.durability - 10;
    }
}

class Warrior {

    @lazyInjectNamed(TYPES.Weapon, "not-throwable")
    @named("not-throwable")
    public primaryWeapon: Weapon;

    @lazyInjectNamed(TYPES.Weapon, "throwable")
    @named("throwable")
    public secondaryWeapon: Weapon;

}

container.bind<Weapon>(TYPES.Weapon).to(Sword).whenTargetNamed("not-throwable");
container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetNamed("throwable");

let warrior = new Warrior();
console.log(warrior.primaryWeapon instanceof Sword); // true
console.log(warrior.primaryWeapon instanceof Shuriken); // true
```

## 使用`@lazyInjectTagged`进行带标签的属性注入

下面的例子演示了如何使用`@lazyInjectTagged`装饰器来注入一个带标签的属性：

```ts
import getDecorators from "inversify-inject-decorators";
import { Container, injectable, tagged } from "inversify";

let container = new Container();
let { lazyInjectTagged } = getDecorators(container);
let TYPES = { Weapon: "Weapon" };

interface Weapon {
    name: string;
    durability: number;
    use(): void;
}

@injectable()
class Sword implements Weapon {
    public name: string;
    public durability: number;
    public constructor() {
        this.durability = 100;
        this.name = "Sword";
    }
    public use() {
        this.durability = this.durability - 10;
    }
}

@injectable()
class Shuriken implements Weapon {
    public name: string;
    public durability: number;
    public constructor() {
        this.durability = 100;
        this.name = "Shuriken";
    }
    public use() {
        this.durability = this.durability - 10;
    }
}

class Warrior {

    @lazyInjectTagged(TYPES.Weapon, "throwable", false)
    @tagged("throwwable", false)
    public primaryWeapon: Weapon;

    @lazyInjectTagged(TYPES.Weapon, "throwable", true)
    @tagged("throwwable", true)
    public secondaryWeapon: Weapon;

}

container.bind<Weapon>(TYPES.Weapon).to(Sword).whenTargetTagged("throwable", false);
container.bind<Weapon>(TYPES.Weapon).to(Shuriken).whenTargetTagged("throwable", true);

let warrior = new Warrior();
console.log(warrior.primaryWeapon instanceof Sword); // true
console.log(warrior.primaryWeapon instanceof Shuriken); // true
```

## 使用`@lazyMultiInject`进行多重注入

下面的例子演示了如何使用`@lazyMultiInject`装饰器来实现属性的多重注入：

```ts
import getDecorators from "inversify-inject-decorators";
import { Container, injectable } from "inversify";

let container = new Container();
let { lazyMultiInject } = getDecorators(container);
let TYPES = { Weapon: "Weapon" };

interface Weapon {
    name: string;
    durability: number;
    use(): void;
}

@injectable()
class Sword implements Weapon {
    public name: string;
    public durability: number;
    public constructor() {
        this.durability = 100;
        this.name = "Sword";
    }
    public use() {
        this.durability = this.durability - 10;
    }
}

@injectable()
class Shuriken implements Weapon {
    public name: string;
    public durability: number;
    public constructor() {
        this.durability = 100;
        this.name = "Shuriken";
    }
    public use() {
        this.durability = this.durability - 10;
    }
}

class Warrior {

    @lazyMultiInject(TYPES.Weapon)
    public weapons: Weapon[];

}

container.bind<Weapon>(TYPES.Weapon).to(Sword);
container.bind<Weapon>(TYPES.Weapon).to(Shuriken);

let warrior = new Warrior();
console.log(warrior.weapons[0] instanceof Sword); // true
console.log(warrior.weapons[1] instanceof Shuriken); // true
```