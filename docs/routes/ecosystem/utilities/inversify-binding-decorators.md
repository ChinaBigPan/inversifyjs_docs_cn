# inversify-binding-decorators

[原文链接](https://github.com/inversify/inversify-binding-decorators)

允许开发者使用ES2016装饰器来声明InversifyJS绑定的工具:

![image](/inversifyjs_docs_cn/images/inversify-binding-decorators-1.png)

## 安装

您可以使用npm进行安装

```bash
npm install inversify inversify-binding-decorators reflect-metadata --save
```

`inversify-binding-decorator`类型定义包含在了npm模块中，TypeScript版本要求是2.0以上。请参阅[InversifyJS文档](https://github.com/inversify/InversifyJS#installation)以了解更多关于安装过程的信息。

## 基础

InversifyJS的API让我们声明绑定时更加流畅：

```ts
import { injectable, Container } from "inversify";
import "reflect-metadata";

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

var container = new Container();
container.bind<Katana>("Katana").to(Katana);
container.bind<Shuriken>("Shuriken").to(Shuriken);
```

该库可以让您使用装饰器语法来声明绑定：

```ts
import { injectable, Container } from "inversify";
import { provide, buildProviderModule } from "inversify-binding-decorators";
import "reflect-metadata";

@provide(Katana)
class Katana implements Weapon {
    public hit() {
        return "cut!";
    }
}

@provide(Shuriken)
class Shuriken implements ThrowableWeapon {
    public throw() {
        return "hit!";
    }
}

var container = new Container();
// Reflects all decorators provided by this package and packages them into a module to be loaded by the container
// 它代表了这个包所提供的所有装饰器，并将它们打包为一个模块以便容器加载。
container.load(buildProviderModule());
```

## 多次使用`@provide`的情况

如果您尝试多次使用`@provide`：

```ts
@provide("Ninja")
@provide("SilentNinja")
class Ninja {
    // ...
}
```

该库会抛出一个错误：

> Cannot apply @injectable decorator multiple times. Please use @provide(ID, true) if you are trying to declare multiple bindings!

我们这么做是防止您误操作多次使用`@provide`装饰器：

您可以通过将第二个参数`force`设置为`true`来绕过这个检测：

```ts
@provide("Ninja", true)
@provide("SilentNinja", true)
class Ninja {
    // ...
}
```

## 使用类、字符串和symbol作为标识符

当您用类作为标识符来调用`@provide`时：

```ts
@provide(Katana)
class Katana {
    public hit() {
        return "cut!";
    }
}

@provide(Ninja)
class Ninja {
    private _katana: Weapon;
    public constructor(
        katana: Weapon
    ) {
        this._katana = katana;
    }
    public fight() { return this._katana.hit(); };
}
```

会在暗处创建一个新的绑定：

```ts
container.bind<Katana>(Katana).to(Katana);
container.bind<Ninja>(Ninja).to(Ninja);
```

除了类，使用字符串作为标识符也是可以的：

```ts
let TYPE = {
    IKatana: "Katana",
    INinja: "Ninja"
};

@provide(TYPE.Katana)
class Katana implements Weapon {
    public hit() {
        return "cut!";
    }
}

@provide(TYPE.Ninja)
class Ninja implements Ninja {

    private _katana: Weapon;

    public constructor(
        @inject(TYPE.Katana) katana: Weapon
    ) {
        this._katana = katana;
    }

    public fight() { return this._katana.hit(); };

}
```

还可以使用`Symbol`作为标识符：

```ts
let TYPE = {
    Katana: Symbol("Katana"),
    Ninja: Symbol("Ninja")
};

@provide(TYPE.Katana)
class Katana implements Weapon {
    public hit() {
        return "cut!";
    }
}

@provide(TYPE.Ninja)
class Ninja implements Ninja {

    private _katana: Weapon;

    public constructor(
        @inject(TYPE.Katana) katana: Weapon
    ) {
        this._katana = katana;
    }

    public fight() { return this._katana.hit(); };

}
```

## 连续绑定装饰器

基本的`@provide`装饰器并不允许声明上下文约束、作用域和其他高级绑定功能。为此，我们提供了另一个装饰器，它允许您使用连续的语法绑定所有的功能：

```ts
import { injectable, Container } from "inversify";
import { fluentProvide, buildProviderModule } from "inversify-binding-decorators";

let TYPE = {
    Weapon : "Weapon",
    Ninja: "Ninja"
};

@fluentProvide(TYPE.Weapon).whenTargetTagged("throwable", true).done();
class Katana implements Weapon {
    public hit() {
        return "cut!";
    }
}

@fluentProvide(TYPE.Weapon).whenTargetTagged("throwable", false).done();
class Shuriken implements Weapon {
    public hit() {
        return "hit!";
    }
}

@fluentProvide(TYPE.Ninja).done();
class Ninja implements Ninja {

    private _katana: Weapon;
    private _shuriken: Weapon;

    public constructor(
        @inject(TYPE.Weapon) @tagged("throwable", false) katana: Weapon,
        @inject(TYPE.Weapon) @tagged("throwable", true) shuriken: ThrowableWeapon
    ) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}

var container = new Container();
container.load(buildProviderModule());
```

您可以为连续装饰器创建别名来满足您的需求：

```ts
let provideThrowable = function(identifier, isThrowable) {
	return provide(identifier)
		      .whenTargetTagged("throwable", isThrowable)
		      .done();
};

@provideThrowable(TYPE.Weapon, true)
class Katana implements Weapon {
    public hit() {
        return "cut!";
    }
}

@provideThrowable(TYPE.Weapon, false)
class Shuriken implements Weapon {
    public hit() {
        return "hit!";
    }
}
```

另一个示例：

```ts
let provideSingleton = function(identifier) {
	return provide(identifier)
		      .inSingletonScope()
		      .done();
};

@provideSingleton(TYPE.Weapon)
class Shuriken implements Weapon {
    public hit() {
        return "hit!";
    }
}
```

## 多次使用`@fluentProvide`装饰器

如果多次使用`@fluentProvide`装饰器：

```ts
let container = new Container();

const provideSingleton = (identifier: any) => {
    return fluentProvide(identifier)
        .inSingletonScope()
        .done();
};

function shouldThrow() {
    @provideSingleton("Ninja")
    @provideSingleton("SilentNinja")
    class Ninja {}
    return Ninja;
}
```

同样我们会抛出一个错误：

> Cannot apply @fluentProvide decorator multiple times but is has been used multiple times in Ninja Please use done(true) if you are trying to declare multiple bindings!

我们这么做是防止您误操作多次使用`@fluentProvide`装饰器：

您可以通过向`done()`方法传递`true`来绕过这个检测：

```ts
const provideSingleton = (identifier: any) => {
    return fluentProvide(identifier)
    .inSingletonScope()
    .done(true); // IMPORTANT! 重要！
};

function shouldThrow() {
    @provideSingleton("Ninja")
    @provideSingleton("SilentNinja")
    class Ninja {}
    return Ninja;
}
let container = new Container();
container.load(buildProviderModule());
```

## 自动provide工具

本库提供了一个小的工具，方便您向模块的所有公共属性添加默认的`@provide`装饰器：

考虑一下下面这个例子：

```ts
import * as entites from "../entities";

let container = new Container();
autoProvide(container, entites);
let warrior = container.get(entites.Warrior);
expect(warrior.fight()).eql("Using Katana...");
```

entities.ts文件的内容类似下面这种：

```ts
export { default as Warrior } from "./warrior";
export { default as Katana } from "./katana";
```

katana.ts文件长这样：

```ts
class Katana {
    public use() {
        return "Using Katana...";
    }
}

export default Katana;
```

warrior.ts文件长这样：

```ts
import Katana from "./katana";
import { inject } from "inversify";

class Warrior {
    private _weapon: Weapon;
    public constructor(
        // we need to declare binding because auto-provide uses @injectable decorator at runtime not compilation time
        // in the future maybe this limitation will desapear thanks to design-time decorators or some other TS feature

        // 因为auto-provide是在运行时而非编译时使用的@injectable装饰器，因此我们需要声明绑定
        @inject(Katana) weapon: Weapon
    ) {
        this._weapon = weapon;
    }
    public fight() {
        return this._weapon.use();
    }
}
export default Warrior;
```



