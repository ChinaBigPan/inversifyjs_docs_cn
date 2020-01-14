# inversify-vanillajs-helpers

[原文链接](https://github.com/inversify/inversify-vanillajs-helpers)

一些使用原生JS或Babel开发InversifyJS的辅助方法。

## 安装

```bash
npm install inversify-vanillajs-helpers
```

## 使用

```ts
import { helpers } from "inversify-vanillajs-helpers";
```

```ts
var helpers = require("inversify-vanillajs-helpers").helpers;
```

## 注释助手

当您使用原生JS时，让您不必一次次手动去注释。一般来说是这样：

```ts
inversify.decorate(inversify.injectable(), Ninja);
inversify.decorate(inversify.inject(TYPES.Katana), Ninja, 0);
inversify.decorate(inversify.inject(TYPES.Shuriken), Ninja, 1);
```

现在只要这样写就可以了：

```ts
helpers.annotate(Ninja, [TYPES.Katana, TYPES.Shuriken]);
```

我们来看一个实例：

```ts
var inversify = require("inversify");
var helpers = require("inversify-vanillajs-helpers").helpers;
require("reflect-metadata");

var TYPES = {
  Ninja: 'Ninja',
  Katana: 'Katana',
  Shuriken: 'Shuriken'
}

class Katana {
  hit () {
    return 'cut!'
  }
}

helpers.annotate(Katana);

class Shuriken {
  throw () {
    return 'hit!'
  }
}

helpers.annotate(Shuriken);

class Ninja {

  constructor(katana, shuriken) {
      this._katana = katana;
      this._shuriken = shuriken;
  }

  fight () { return this._katana.hit() }
  sneak () { return this._shuriken.throw() }

}

helpers.annotate(Ninja, [TYPES.Katana, TYPES.Shuriken]);

// Declare bindings
var container = new inversify.Container()
container.bind(TYPES.Ninja).to(Ninja);
container.bind(TYPES.Katana).to(Katana);
container.bind(TYPES.Shuriken).to(Shuriken);

// Resolve dependencies
var ninja = container.get(TYPES.Ninja);
console.log(ninja.fight(), ninja.sneak());
```

## 具名注释

您还可以使用annotation方法声明具名元数据:

```ts
helpers.annotate(
    Ninja,
    [
        { type: TYPES.Katana, named: "not-throwable" },
        { type: TYPES.Shuriken, named: "throwable" }
    ]
);
```

## 带标签的注释

您还可以使用`annotate`方法声明带标签的元数据:

```ts
helpers.annotate(
    Ninja,
    [
        { type: TYPES.Katana, tagged: { key: "throwable", value: false } },
        { type: TYPES.Shuriken, tagged: { key: "throwable", value: true } }
    ]
);
```

## 注册helper

有了这些辅助方法，您用原生JS开发时再也不必重复地声明注释和注册模板了：

```ts
inversify.decorate(inversify.injectable(), Ninja);
inversify.decorate(inversify.inject(TYPES.Katana), Ninja, 0);
inversify.decorate(inversify.inject(TYPES.Shuriken), Ninja, 1);
container.bind(TYPES.Ninja).to(Ninja);
```

只需要这样既可：

```ts
let register = helpers.register(container);
register(TYPES.Ninja, [TYPES.Katana, TYPES.Shuriken])(Ninja);
```

当开发者使用了Babel时，该helper仍旧可以作为类装饰器：

```ts
let register = helpers.register(container);

@register(TYPES.Ninja, [TYPES.Katana, TYPES.Shuriken])
class Ninja {

  constructor(katana, shuriken) {
      this._katana = katana;
      this._shuriken = shuriken;
  }

  fight () { return this._katana.hit() }
  sneak () { return this._shuriken.throw() }

}
```

请看下面这个例子：

```ts
var inversify = require("inversify");
var helpers =  require("inversify-vanillajs-helpers").helpers;
require("reflect-metadata");

var TYPES = {
  Ninja: 'Ninja',
  Katana: 'Katana',
  Shuriken: 'Shuriken'
}

class Katana {
  hit () {
    return 'cut!'
  }
}

class Shuriken {
  throw () {
    return 'hit!'
  }
}

class Ninja {

  constructor(katana, shuriken) {
      this._katana = katana;
      this._shuriken = shuriken;
  }

  fight () { return this._katana.hit() }
  sneak () { return this._shuriken.throw() }

}

// Declare bindings
var container = new inversify.Container();
var register = helpers.register(container);
register(TYPES.Katana)(Katana);
register(TYPES.Shuriken)(Shuriken);
register(TYPES.Ninja, [TYPES.Katana, TYPES.Shuriken])(Ninja);

// Resolve dependencies
var ninja = container.get(TYPES.Ninja);
console.log(ninja.fight(), ninja.sneak());
```

以此类推，许多类型绑定都可以采取这种方式。

**registerSelf**

```ts
var registerSelf = helpers.registerSelf(container);
registerSelf()(Katana);
```

**registerConstantValue**

```ts
var registerConstantValue = helpers.registerConstantValue(container);
registerConstantValue(TYPES.Katana, new Katana());
```

**registerDynamicValue**

```ts
var registerDynamicValue = helpers.registerDynamicValue(container);
registerDynamicValue(TYPES.Katana, (context) => { new Katana(); });
```

**registerConstructor**

```ts
var registerConstructor = helpers.registerConstructor(container);
registerConstructor(TYPES.Katana)(Katana);
```

**registerFunction**

```ts
var registerFunction = helpers.registerFunction(container);
registerFunction(TYPES.SomeFunction, () {
  console.log("I'm doing something...");
});
```

**registerAutoFactory**

```ts
var registerAutoFactory = helpers.registerAutoFactory(container);
registerAutoFactory(TYPES.KatanaFactory, TYPES.Katana);
```

**registerFactory**

```ts
var registerFactory = helpers.registerFactory(container);
registerFactory(TYPES.KatanaFactory, (context) => {
  return () => {
    return context.container.get("Katana");
  };
});
```

**registerProvider**

```ts
var registerProvider = helpers.registerProvider(container);
registerProvider(TYPES.KatanaProvider, (context) => {
    return () => {
        return new Promise<Katana>((resolve) => {
            let katana = context.container.get("Katana");
            resolve(katana);
        });
    };
});
```

## 声明绑定约束

辅助函数`register`方便您连续绑定声明API：

```ts
var register = helpers.register(container);

register(TYPES.Weapon, (b) => {
    b.whenTargetTagged("throwable", false);
})(Katana);

register(TYPES.Weapon, (b) => {
    b.whenTargetTagged("throwable", true);
})(Shuriken);

register(TYPES.Ninja, [
  { tagged: { key: "throwable", value: false }, type: "Weapon" },
  { tagged: { key: "throwable", value: true }, type: "Weapon" }
])(Ninja);
```

## Babel 装饰器

即便使用了Babel也一样可以使用`register`辅助函数作为类的装饰器，使用[transform-decorators-legacy](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy)插件即可。

```ts
let helpers = require("inversify-vanillajs-helpers").helpers;
let inversify = require("inversify");
require("reflect-metadata");

let container = new inversify.Container();
let register = helpers.register(container);

let TYPE = {
    Warrior: "Warrior",
    Weapon: "Weapon"
};

@register(
    TYPE.Weapon, [],
    (b) => { b.whenTargetTagged("throwable", false); }
)
class Katana {
    constructor() {
        this.name = "Katana";
    }
}

@register(
    TYPE.Weapon, [],
    (b) => { b.whenTargetTagged("throwable", true); }
)
class Shuriken {
    constructor() {
        this.name = "Shuriken";
    }
}

@register(
    TYPE.Warrior,
    [
        { tagged: { key: "throwable", value: false }, type: TYPE.Weapon },
        { tagged: { key: "throwable", value: true }, type: TYPE.Weapon }
    ]
)
class Ninja {
    constructor(primaryWeapon, secondaryWeapon) {
        this.primaryWeapon = primaryWeapon;
        this.secondaryWeapon = secondaryWeapon;
    }
}

let ninja = container.get(TYPE.Warrior);
expect(ninja.primaryWeapon.name).to.eql("Katana");
expect(ninja.secondaryWeapon.name).to.eql("Shuriken");
```

## 演示Demo

您可以在这找到[Demo](https://runkit.com/remojansen/inversify-vanillajs-helpers-demo)

```ts
var helpers = require("inversify-vanillajs-helpers").helpers;
var inversify = require("inversify");
require("reflect-metadata");

class Katana {
    constructor() {
        this.name = "Katana";
    }
}

class Shuriken {
    constructor() {
        this.name = "Shuriken";
    }
}

class Ninja {
    constructor(primaryWeapon, secondaryWeapon) {
        this.primaryWeapon = primaryWeapon;
        this.secondaryWeapon = secondaryWeapon;
    }
}

let container = new inversify.Container();
let register = helpers.register(container);
 
let TYPE = {
    Warrior: "Warrior",
    Weapon: "Weapon"
};

register(TYPE.Weapon, [], (b) => b.whenTargetTagged("throwable", false))(Katana);
register(TYPE.Weapon, [], (b) => b.whenTargetTagged("throwable", true))(Shuriken);

register(TYPE.Warrior, [
    { tagged: { key: "throwable", value: false }, type: TYPE.Weapon },
    { tagged: { key: "throwable", value: true }, type: TYPE.Weapon }
])(Ninja);
 
container.get(TYPE.Warrior);
```









