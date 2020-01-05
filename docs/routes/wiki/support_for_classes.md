---
title: 对类的支持
sidebarDepth: 2
---

# 对类的支持

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/classes_as_id.md)

InversifyJS 允许您的类直接依赖其他类。当您想要这样做时，请使用`@injectable`装饰器，无需使用`@inject`装饰器。

`@inject`装饰器在使用类的时候是不需要的，因为 TypeScript 编译器会为我们生成元数据(metadata)，除非您：

- 没有引入`reflect-metadata`
- 没有在`tsconfig.json`中把`emitDecoratorMetadata`设置为`true`

```ts
import { Container, injectable, inject } from "inversify";

@injectable()
class Katana {
    public hit() {
        return "cut!";
    }
}

@injectable()
class Shuriken {
    public throw() {
        return "hit!";
    }
}

@injectable()
class Ninja implements Ninja {

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(katana: Katana, shuriken: Shuriken) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}

var container = new Container();
container.bind<Ninja>(Ninja).to(Ninja);
container.bind<Katana>(Katana).to(Katana);
container.bind<Shuriken>(Shuriken).to(Shuriken);
```

## 具体类型自绑定

如果您需要处理具体类型，那么很频繁的绑定注册想必让人十分懊恼：

```ts
container.bind<Samurai>(Samurai).to(Samurai);
```

我们可以使用`toSelf`方法来简化这一流程：

```ts
container.bind<Samurai>(Samurai).toSelf();
```

## 已知的一些限制：类作为标识符和循环依赖

一个例外：

> 错误：在DOM类的第一个参数中没有附加`@inject`或`@multiinject`

如果在循环依赖中使用了类作为标识符，将会抛出错误。举例来说：

```ts
import "reflect-metadata";
import { Container, injectable } from "inversify";
import getDecorators from "inversify-inject-decorators";

let container = new Container();
let { lazyInject } = getDecorators(container);

@injectable()
class Dom {
    public domUi: DomUi;
    constructor (domUi: DomUi) {
        this.domUi = domUi;
    }
}

@injectable()
class DomUi {
    @lazyInject(Dom) public dom: Dom;
}

@injectable()
class Test {
    constructor(dom: Dom) {
        console.log(dom);
    }
}

container.bind<Dom>(Dom).toSelf().inSingletonScope();
container.bind<DomUi>(DomUi).toSelf().inSingletonScope();
const dom = container.resolve(Test); // 这样会报错！
```

这个错误可能有些迷惑性，因为当使用类作为服务标识符时，`@inject`不应该是必需的，而且如果我们添加了`@inject(Dom)`或`@inject(DomUi)`装饰器的话，仍旧会报出相同的错误。究其原因，是因为在调用装饰器的时候，类尚未声明，所以装饰器是以`@inject(undefined)`的形式调用的。这就会让 InversifyJS 认为并未添加装饰器。

解决方法是使用Symbol，如`Symbol.for("Dom")`作为服务标识符，弃用类标识符。

```ts
import "reflect-metadata";
import { Container, injectable, inject } from "inversify";
import getDecorators from "inversify-inject-decorators";

const container = new Container();
const { lazyInject } = getDecorators(container);

const TYPE = {
    Dom: Symbol.for("Dom"),
    DomUi: Symbol.for("DomUi")
};

@injectable()
class DomUi {
    public dom: Dom;
    public name: string;
    constructor (
        @inject(TYPE.Dom) dom: Dom
    ) {
        this.dom = dom;
        this.name = "DomUi";
    }
}

@injectable()
class Dom {
    public name: string;
    @lazyInject(TYPE.DomUi) public domUi: DomUi;
    public constructor() {
        this.name = "Dom";
    }
}

@injectable()
class Test {
    public dom: Dom;
    constructor(
        @inject(TYPE.Dom) dom: Dom
    ) {
        this.dom = dom;
    }
}

container.bind<Dom>(TYPE.Dom).to(Dom).inSingletonScope();
container.bind<DomUi>(TYPE.DomUi).to(DomUi).inSingletonScope();

const test = container.resolve(Test); // 这个可以！
```