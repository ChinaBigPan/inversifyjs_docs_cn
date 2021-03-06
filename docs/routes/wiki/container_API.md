---
title: 容器API
sidebarDepth: 2
---

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/container_api.md)

# 容器API

InversifyJS 容器提供了一些便利方法来帮助开发者处理**多重注入**和**模糊绑定**的情况。

## 容器配置项

### defaultScope

默认采用的是`瞬态(transient)`作用域，您可以在声明绑定的时候更改类型模式。

```ts
container.bind<Warrior>(TYPES.Warrior).to(Ninja).inSingletonScope();
container.bind<Warrior>(TYPES.Warrior).to(Ninja).inTransientScope();
```

您可以在初始化时通过容器配置项改变默认的作用域。

```js
let container = new Container({ defaultScope: "Singleton" });
```

### autoBindInjectable

该配置项的作用是启动`@injectable()`在装饰类的时候的自动绑定；

```ts
let container = new Container({ autoBindInjectable: true });
container.isBound(Ninja);          // returns false
container.get(Ninja);              // returns a Ninja
container.isBound(Ninja);          // returns true
```

若同样已经手动绑定，则以手动绑定为准。

```ts
let container = new Container({ autoBindInjectable: true });
container.bind(Ninja).to(Samurai);
container.get(Ninja);              // returns a Samurai
```

### skipBaseClassChecks

您可以通过配置该项来跳过对`@injectable`属性基类的检查，如果`@injectable`类继承(extend)了不受您控制的类(比如第三方类)，那么这个方法就特别有用了。该项的默认值是`false`。


```ts
let container = new Container({ skipBaseClassChecks: true });
```

## Container.merge(a: Container, b: Container) <Badge text="注意C是大写字母" type="warn"/>

将两个容器进行合并：

```ts
@injectable()
class Ninja {
    public name = "Ninja";
}

@injectable()
class Shuriken {
    public name = "Shuriken";
}

let CHINA_EXPANSION_TYPES = {
    Ninja: "Ninja",
    Shuriken: "Shuriken"
};

let chinaExpansionContainer = new Container();
chinaExpansionContainer.bind<Ninja>(CHINA_EXPANSION_TYPES.Ninja).to(Ninja);
chinaExpansionContainer.bind<Shuriken>(CHINA_EXPANSION_TYPES.Shuriken).to(Shuriken);

@injectable()
class Samurai {
    public name = "Samurai";
}

@injectable()
class Katana {
    public name = "Katana";
}

let JAPAN_EXPANSION_TYPES = {
    Katana: "Katana",
    Samurai: "Samurai"
};

let japanExpansionContainer = new Container();
japanExpansionContainer.bind<Samurai>(JAPAN_EXPANSION_TYPES.Samurai).to(Samurai);
japanExpansionContainer.bind<Katana>(JAPAN_EXPANSION_TYPES.Katana).to(Katana);

let gameContainer = Container.merge(chinaExpansionContainer, japanExpansionContainer);
expect(gameContainer.get<Ninja>(CHINA_EXPANSION_TYPES.Ninja).name).to.eql("Ninja");
expect(gameContainer.get<Shuriken>(CHINA_EXPANSION_TYPES.Shuriken).name).to.eql("Shuriken");
expect(gameContainer.get<Samurai>(JAPAN_EXPANSION_TYPES.Samurai).name).to.eql("Samurai");
expect(gameContainer.get<Katana>(JAPAN_EXPANSION_TYPES.Katana).name).to.eql("Katana");
```

## container.getNamed()

具名绑定：

```ts
let container = new Container();
container.bind<Weapon>("Weapon").to(Katana).whenTargetNamed("japanese");
container.bind<Weapon>("Weapon").to(Shuriken).whenTargetNamed("chinese");

let katana = container.getNamed<Weapon>("Weapon", "japanese");
let shuriken = container.getNamed<Weapon>("Weapon", "chinese");
```

## container.getTagged()

带标签绑定

```ts
let container = new Container();
container.bind<Weapon>("Weapon").to(Katana).whenTargetTagged("faction", "samurai");
container.bind<Weapon>("Weapon").to(Shuriken).whenTargetTagged("faction", "ninja");

let katana = container.getTagged<Weapon>("Weapon", "faction", "samurai");
let shuriken = container.getTagged<Weapon>("Weapon", "faction", "ninja");
```

## container.getAll()

根据传入的标识符，返回所有可用的绑定

```ts
let container = new Container();
container.bind<Weapon>("Weapon").to(Katana);
container.bind<Weapon>("Weapon").to(Shuriken);

let weapons = container.getAll<Weapon>("Weapon");  // returns Weapon[]
```

## container.getAllNamed()

根据传入的标识符，返回所有可用的具名绑定，这些绑定符合设定的限制条件：

```ts
let container = new Container();

interface Intl {
    hello?: string;
    goodbye?: string;
}

container.bind<Intl>("Intl").toConstantValue({ hello: "bonjour" }).whenTargetNamed("fr");
container.bind<Intl>("Intl").toConstantValue({ goodbye: "au revoir" }).whenTargetNamed("fr");

container.bind<Intl>("Intl").toConstantValue({ hello: "hola" }).whenTargetNamed("es");
container.bind<Intl>("Intl").toConstantValue({ goodbye: "adios" }).whenTargetNamed("es");

let fr = container.getAllNamed<Intl>("Intl", "fr");
expect(fr.length).to.eql(2);
expect(fr[0].hello).to.eql("bonjour");
expect(fr[1].goodbye).to.eql("au revoir");

let es = container.getAllNamed<Intl>("Intl", "es");
expect(es.length).to.eql(2);
expect(es[0].hello).to.eql("hola");
expect(es[1].goodbye).to.eql("adios");
```

## container.getAllTagged()

根据传入的标识符，返回所有可用的带标签绑定，这些绑定符合设定的限制条件：

```ts
let container = new Container();

interface Intl {
    hello?: string;
    goodbye?: string;
}

container.bind<Intl>("Intl").toConstantValue({ hello: "bonjour" }).whenTargetTagged("lang", "fr");
container.bind<Intl>("Intl").toConstantValue({ goodbye: "au revoir" }).whenTargetTagged("lang", "fr");

container.bind<Intl>("Intl").toConstantValue({ hello: "hola" }).whenTargetTagged("lang", "es");
container.bind<Intl>("Intl").toConstantValue({ goodbye: "adios" }).whenTargetTagged("lang", "es");

let fr = container.getAllTagged<Intl>("Intl", "lang", "fr");
expect(fr.length).to.eql(2);
expect(fr[0].hello).to.eql("bonjour");
expect(fr[1].goodbye).to.eql("au revoir");

let es = container.getAllTagged<Intl>("Intl", "lang", "es");
expect(es.length).to.eql(2);
expect(es[0].hello).to.eql("hola");
expect(es[1].goodbye).to.eql("adios");
```

## container.isBound(serviceIdentifier: ServiceIdentifier)

当我们想要检查一下容器是否已经注册了传入的绑定的时候，请使用`isBound`方法。

```ts
interface Warrior {}
let warriorId = "Warrior";
let warriorSymbol = Symbol.for("Warrior");

@injectable()
class Ninja implements Warrior {}

interface Katana {}
let katanaId = "Katana";
let katanaSymbol = Symbol.for("Katana");

@injectable()
class Katana implements Katana {}

let container = new Container();
container.bind<Warrior>(Ninja).to(Ninja);
container.bind<Warrior>(warriorId).to(Ninja);
container.bind<Warrior>(warriorSymbol).to(Ninja);

expect(container.isBound(Ninja)).to.eql(true);
expect(container.isBound(warriorId)).to.eql(true);
expect(container.isBound(warriorSymbol)).to.eql(true);
expect(container.isBound(Katana)).to.eql(false);
expect(container.isBound(katanaId)).to.eql(false);
expect(container.isBound(katanaSymbol)).to.eql(false);
```

## container.isBoundNamed(serviceIdentifier: ServiceIdentifier, named: string)

您可以使用`isBoundNamed`方法来检查容器是否已经绑定了传入的具名绑定。

```ts
const zero = "Zero";
const invalidDivisor = "InvalidDivisor";
const validDivisor = "ValidDivisor";
let container = new Container();

expect(container.isBound(zero)).to.eql(false);
container.bind<number>(zero).toConstantValue(0);
expect(container.isBound(zero)).to.eql(true);

container.unbindAll();
expect(container.isBound(zero)).to.eql(false);
container.bind<number>(zero).toConstantValue(0).whenTargetNamed(invalidDivisor);
expect(container.isBoundNamed(zero, invalidDivisor)).to.eql(true);
expect(container.isBoundNamed(zero, validDivisor)).to.eql(false);

container.bind<number>(zero).toConstantValue(1).whenTargetNamed(validDivisor);
expect(container.isBoundNamed(zero, invalidDivisor)).to.eql(true);
expect(container.isBoundNamed(zero, validDivisor)).to.eql(true);
```

## container.isBoundTagged(serviceIdentifier: ServiceIdentifier, key: string, value: any)

您可以使用`isBoundTagged`方法来检查容器是否已经绑定了传入的带标签绑定。

```ts
const zero = "Zero";
const isValidDivisor = "IsValidDivisor";
let container = new Container();

expect(container.isBound(zero)).to.eql(false);
container.bind<number>(zero).toConstantValue(0);
expect(container.isBound(zero)).to.eql(true);

container.unbindAll();
expect(container.isBound(zero)).to.eql(false);
container.bind<number>(zero).toConstantValue(0).whenTargetTagged(isValidDivisor, false);
expect(container.isBoundTagged(zero, isValidDivisor, false)).to.eql(true);
expect(container.isBoundTagged(zero, isValidDivisor, true)).to.eql(false);

container.bind<number>(zero).toConstantValue(1).whenTargetTagged(isValidDivisor, true);
expect(container.isBoundTagged(zero, isValidDivisor, false)).to.eql(true);
expect(container.isBoundTagged(zero, isValidDivisor, true)).to.eql(true);
```

## container.rebind(serviceIdentifier: ServiceIdentifier)

您可以使用`rebind`方法来用传入的服务标识符替换掉所有现有的绑定。该方法会返回一个`BindingToSyntax`实例，从而方便您创建一个替代绑定。

```ts
let TYPES = {
    someType: "someType"
};

let container = new Container();
container.bind<number>(TYPES.someType).toConstantValue(1);
container.bind<number>(TYPES.someType).toConstantValue(2);

let values1 = container.getAll(TYPES.someType);
expect(values1[0]).to.eq(1);
expect(values1[1]).to.eq(2);

container.rebind<number>(TYPES.someType).toConstantValue(3);
let values2 = container.getAll(TYPES.someType);
expect(values2[0]).to.eq(3);
expect(values2[1]).to.eq(undefined);
```

## container.resolve(constructor: Newable)

该方法和`container.get<T>(serviceIdentifier: ServiceIdentifier<T>)`相似，但它允许用户在未声明绑定的情况下创建实例：

```ts
@injectable()
class Katana {
    public hit() {
        return "cut!";
    }
}

@injectable()
class Ninja implements Ninja {
    public katana: Katana;
    public constructor(katana: Katana) {
        this.katana = katana;
    }
    public fight() { return this.katana.hit(); }
}

const container = new Container();
container.bind(Katana).toSelf();

const tryGet = () => container.get(Ninja);
expect(tryGet).to.throw("No matching bindings found for serviceIdentifier: Ninja");

const ninja = container.resolve(Ninja);
expect(ninja.fight()).to.eql("cut!");
```

请注意：它仅允许跳过在依赖的**根元素**一级的声明。所有的子依赖项（例如前面示例中的`Katana`）的绑定仍需要声明。