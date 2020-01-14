---
title: 继承
sidebarDepth: 2
---

# 继承

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/inheritance.md)

我们尝试向开发者提供类似下面这种错误反馈：

> Error: Missing required @injectable annotation in: SamuraiMaster

这很有用但是遇到继承情况就会产生一些问题了。

举个例子，下面的代码片段会抛出一个错误：


> The number of constructor arguments in a derived class must be >= than the number of constructor arguments of its base class.

```ts
@injectable()
class Warrior {
    public rank: string;
    public constructor(rank: string) { // 参数数目： 1
        this.rank = rank;
    }
}

@injectable()
class SamuraiMaster extends Warrior  {
    public constructor() { // 参数数目： 0
       super("master");
    }
}
```

为解决这个问题，InversifyJS对继承的使用作出了限制：

> 派生类必须显式地声明其构造函数。

> 派生类的构造函数参数的数量必须 >= 其基类的构造函数参数数量

如果没有遵守该规则，就会抛出如下异常：

> Error: The number of constructor arguments in the derived class SamuraiMaster must be >= than the number of constructor arguments of its base class.

当然，开发者可以采取一些方法来突破这个限制：

### 解决方案 A) 使用`@unmanaged()`装饰器

`@unmanaged()`装饰器容用户能够标记一个会被人工注入到基类的参数。我们使用"unmanaged"这个词的原因是InversifyJS并不会控制用户传入的值，也不会管理他们的注入。

下面的代码段展示了如何使用这个装饰器：

```ts
import { 
    Container, injectable, unmanaged 
} from "../src/inversify";

const BaseId = "Base";

@injectable()
class Base {
    public prop: string;
    public constructor(@unmanaged() arg: string) {
        this.prop = arg;
    }
}

@injectable()
class Derived extends Base {
    public constructor() {
        super("unmanaged-injected-value");
    }
}

container.bind<Base>(BaseId).to(Derived);
let derived = container.get<Base>(BaseId);

derived instanceof Derived2; // true
derived.prop; // "unmanaged-injected-value"
```

### 解决方案 B）属性setter

我们可以使用`public`、`protected`或`private`关键字和属性setter来避免注入基类：

```ts
@injectable()
class Warrior {
    protected rank: string;
    public constructor() { // 参数数量：0
        this.rank = null;
    }
}

@injectable()
class SamuraiMaster extends Warrior {
    public constructor() { // 参数数量：0
       super();
	   this.rank = "master";
    }
}
```

### 解决方案 C）属性注入

我们还可以使用属性注入来避免注入基类：

```ts
@injectable()
class Warrior {
    protected rank: string;
    public constructor() {} // 参数数量： 0
}

let TYPES = { Rank: "Rank" };

@injectable()
class SamuraiMaster extends Warrior  {

    @injectNamed(TYPES.Rank, "master")
    @named("master")
    protected rank: string;
	
    public constructor() { // 参数数量： 0
       super();
    }
}

container.bind<string>(TYPES.Rank)
      .toConstantValue("master")
	  .whenTargetNamed("master");
```

### 解决方案 D) 注入派生类

如果您觉的注入基类也没什么问题，那么您可以通过注入派生类的`super`方法来实现基类注入。

```ts
@injectable()
class Warrior {
    protected rank: string;
    public constructor(rank: string) { // 参数数量：1
        this.rank = rank;
    }
}

let TYPES = { Rank: "Rank" };

@injectable()
class SamuraiMaster extends Warrior  {
    public constructor(
		@inject(TYPES.Rank) @named("master") rank: string // 参数数量：1
	) {
       super(rank);
    }
}

container.bind<string>(TYPES.Rank)
      .toConstantValue("master")
	  .whenTargetNamed("master");
```

下面这样也可以嗷：

```ts
@injectable()
class Warrior {
    protected rank: string;
    public constructor(rank: string) { // args count = 1
        this.rank = rank;
    }
}

interface Weapon {
	name: string;
}

@injectable()
class Katana implements Weapon {
	public name: string;
	public constructor() {
		this.name = "Katana";
	}
}

let TYPES = { 
    Rank: "Rank",
    Weapon: "Weapon"
};

@injectable()
class SamuraiMaster extends Warrior  {
	public weapon: Weapon;
    public constructor(
		@inject(TYPES.Rank) @named("master") rank: string, // args count = 2
		@inject(TYPES.Weapon) weapon: Weapon
	) {
       super(rank);
	   this.weapon = weapon;
    }
}

container.bind<Weapon>(TYPES.Weapon).to(Katana);

container.bind<string>(TYPES.Rank)
      .toConstantValue("master")
      .whenTargetNamed("master");
```


### 解决方案 E）跳过基类`@injectable`检查

将容器的`skipBaseClassChecks`设置为`true`可以禁用所有的基类检查。这意味着它将完全由用户来调用构造函数内的`super()`，参数数量和调用时机都取决于开发者自己。

```ts
// Not injectable
class UnmanagedBase {
    public constructor(
        public unmanagedDependency: string
    ) {
    }
}

@injectable()
class InjectableDerived extends UnmanagedBase  {
    public constructor(
        // Any arguments defined here will be injected like normal
        // 这里定义的任何参数会和平常一样注入
    ) {
        super("Don't forget me..."); // <= 这个别忘了
    }
}

const container = new Container({skipBaseClassChecks: true});
container.bind(InjectableDerived).toSelf();
```

这么做是可以的，并且您可以像往常一样使用您的`InjectableDerived`类，包括在容器内任何地方通过contstructor注入依赖。需要注意的是，必须确保`UnmanagedBase`接收到正确的参数。

### 如果我的基类是由第三方模块提供的该怎么办呢？

在某些情况下，您可能会看到关于类中缺少注释的错误，因为这些类是由第三方模块提供的:

> Error: Missing required @injectable annotation in: SamuraiMaster

您可以通过`decorate`方法来处理这个问题：

```ts
import { decorate, injectable } from "inversify";
import SomeClass from "some-module";

decorate(injectable(), SomeClass);
return SomeClass;
```

[这里](https://github.com/inversify/InversifyJS/blob/master/wiki/basic_js_example.md)有更多示例
