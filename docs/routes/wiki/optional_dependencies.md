---
title: 可选依赖
sidebarDepth: 2
---

# 可选依赖

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/optional_dependencies.md)

我们可以使用`@optional()`装饰器声明一个可选依赖:

```ts
@injectable()
class Katana {
    public name: string;
    public constructor() {
        this.name = "Katana";
    }
}

@injectable()
class Shuriken {
    public name: string;
    public constructor() {
        this.name = "Shuriken";
    }
}

@injectable()
class Ninja {
    public name: string;
    public katana: Katana;
    public shuriken: Shuriken;
    public constructor(
        @inject("Katana") katana: Katana,
        @inject("Shuriken") @optional() shuriken: Shuriken // Optional!
    ) {
        this.name = "Ninja";
        this.katana = katana;
        this.shuriken = shuriken;
    }
}

let container = new Container();

container.bind<Katana>("Katana").to(Katana);
container.bind<Ninja>("Ninja").to(Ninja);

let ninja = container.get<Ninja>("Ninja");
expect(ninja.name).to.eql("Ninja");
expect(ninja.katana.name).to.eql("Katana");
expect(ninja.shuriken).to.eql(undefined);

container.bind<Shuriken>("Shuriken").to(Shuriken);

ninja = container.get<Ninja>("Ninja");
expect(ninja.name).to.eql("Ninja");
expect(ninja.katana.name).to.eql("Katana");
expect(ninja.shuriken.name).to.eql("Shuriken");
```

在上面示例中，我们可以看到第一次解析`Ninja`时，它的属性`shuriken`是undefined的，因为我们并没有为`shuriken`声明绑定，且属性使用了`@optional()`装饰器进行修饰。  

在为`shuriken`声明了绑定后：

```ts
container.bind<Shuriken>("Shuriken").to(Shuriken);
```

所有已解析的`Ninja`实例将包含`Shuriken`实例。

## 默认值

如果一个依赖项被`@optional()`装饰器修饰，我们便可以像在其他TypeScript应用中一样声明一个默认值:

```ts
@injectable()
class Ninja {
    public name: string;
    public katana: Katana;
    public shuriken: Shuriken;
    public constructor(
        @inject("Katana") katana: Katana,
        @inject("Shuriken") @optional() shuriken: Shuriken = { name: "DefaultShuriken" } // 默认值
    ) {
        this.name = "Ninja";
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```