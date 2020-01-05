---
title: postConstruct 装饰器
sidebarDepth: 2
---

# postConstruct 装饰器

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/post_construct.md)

我们向类方法添加`@postConstruct`装饰器是可行的。该装饰器会在对象初始化后和任何句柄激活前运行。在调用构造函数但组件尚未初始化，或者在希望在构造函数调用后执行初始化逻辑的情况下，就是它大显身手的时候。


在其他一些情况下，它会保证当对象在单例作用域内使用时，这个方法只调用一次。参见下方示例：

```ts
interface Katana {
    use: () => void;
}

@injectable()
class Katana implements Katana {
    constructor() {
        console.log("Katana is born");
    }
    
    public use() {
        return "Used Katana!";
    }
    
    @postConstruct()
    public testMethod() {
        console.log("Used Katana!")
    }
}
```

```ts
container.bind<Katana>("Katana").to(Katana);
```

```ts
let catana = container.get<Katana>();
> Katana is born
> Used Katana!
```

::: warning 注意
您不要在同一个类中使用**一个以上**的`@postConstruct`装饰器。这会抛出一个错误。
:::

```ts
class Katana {
    @postConstruct()
        public testMethod1() {/* ... */}

    @postConstruct()
        public testMethod2() {/* ... */}
    }
            
Katana.toString();
> Error("Cannot apply @postConstruct decorator multiple times in the same class")
```

在JavaScript中使用：

```ts
inversify.decorate(inversify.postConstruct(), Katana.prototype, "testMethod");
```