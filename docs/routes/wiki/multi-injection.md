---
title: 多重注入
---

# 多重注入

当有两个以上的具体类型绑定了一个抽象时，我们可以使用多重注入(multi-injection)。多亏有`@multiInject`装饰器，我们才能够将`Weapon`数组通过`Ninja`类的构造器进行注入：

```ts
interface Weapon {
    name: string;
}

@injectable()
class Katana implements Weapon {
    public name = "Katana";
}

@injectable()
class Shuriken implements Weapon {
    public name = "Shuriken";
}

interface Ninja {
    katana: Weapon;
    shuriken: Weapon;
}

@injectable()
class Ninja implements Ninja {
    public katana: Weapon;
    public shuriken: Weapon;
    public constructor(
	    @multiInject("Weapon") weapons: Weapon[]
    ) {
        this.katana = weapons[0];
        this.shuriken = weapons[1];
    }
}
```

我们将`Katana`和`Shuriken`绑定到`Weapon`：

```ts
container.bind<Ninja>("Ninja").to(Ninja);
container.bind<Weapon>("Weapon").to(Katana);
container.bind<Weapon>("Weapon").to(Shuriken);
```

### 关于扩展运算符(...)

在InversifyJS的早期版本中，扩展运算符(...)通常会不起作用而且不会抛出任何错误。这显然是我们无法接受的，因此开发组做出了修复，允许您使用扩展运算符注入数组。但我们并不推荐这么做，因为它看起来没什么用。

您可以像下面这样使用`@multiInject`和`...`：

```ts
@injectable()
class Foo {
    public bar: Bar[];
    constructor(@multiInject(BAR) ...args: Bar[][]) {
        // args will always contain one unique item the value of that item is a Bar[] 
        this.bar = args[0];
    }
}
```

这里有一个问题，`args`的类型被定义为`Bar[][]`，这是因为`multiInject`会将注入项使用数组进行包裹而扩展运算符也会这么做。其结果就是注入项被数组包裹了两层。

我们尝试过解决这个问题，可惜的是唯一的解决办法是通过`@spread()`装饰器生成一些额外的元数据。

```ts
@injectable()
class Foo {
    public bar: Bar[];
    constructor(@multiInject(BAR) @spread() ...args: Bar[]) {
        this.bar = args[0];
    }
}
```

于是我们放弃了这个想法，因为当没有其他方法可以实现某些东西时，最好使用装饰器。这样一来我们只使用`@multiInject`而不使用`...`就可以达成预期的结果了，这么做更简单。

```ts
@injectable()
class Foo {
    public bar: Bar[];
    constructor(@multiInject(BAR) args: Bar[]) {
        this.bar = args;
    }
}
```





