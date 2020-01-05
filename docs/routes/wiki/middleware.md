---
title: 中间件
sidebarDepth: 2
---

# 中间件

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/middleware.md)

InversifyJS 在解析依赖项之前会执行3个强制操作：

- Annotation（注释）
- Planning（规划）
- Resolution（解析）

在某些情况下还有两个额外操作：

- Activation （激活） 
- Middleware （中间件）

如果我们配置了中间件的话，它们会在规划、解析和激活阶段之前或之后执行。

中间件常用来添加开发工具。此类工具将帮助我们识别开发过程中的问题。

## 基本中间件

```ts
import { interfaces, Container } from "inversify";

function logger(planAndResolve: interfaces.Next): interfaces.Next {
    return (args: interfaces.NextArgs) => {
        let start = new Date().getTime();
        let result = planAndResolve(args);
        let end = new Date().getTime();
        console.log(`wooooo  ${end - start}`);
        return result;
    };
}

let container = new Container();
container.applyMiddleware(logger);
```

现在我们声明了一个中间件。我们可以创建一个容器并使用其`applyMiddleware`方法来使用它：

```ts
interface Ninja {}

@injectable()
class Ninja implements Ninja {}

let container = new Container();
container.bind<Ninja>("Ninja").to(Ninja);

container.applyMiddleware(logger);
```

我们声明的日志中间件就会在控制台输出执行时间：

```ts
let ninja = container.get<Ninja>("Ninja");

> 21
```

## 多个中间件

当我们应用多个中间件的时候：

```ts
container.applyMiddleware(middleware1, middleware2);
```

中间件将按照从左到右的顺序进行调用，即先调用`middleware2`后调用`middleware2`。

## 上下文拦截器

有些时候您会需要拦截解析过程。

默认的`contextInterceptor`是以`args`属性的形式传递到中间件内部的。

```ts

function middleware1(planAndResolve: interfaces.Next): interfaces.Next<any> {
    return (args: interfaces.NextArgs) => {
        // args.nextContextInterceptor
        // ...
    };
}
```

您可以使用函数来扩展默认的`contextInterceptor`:

```ts
function middleware1(planAndResolve: interfaces.Next<any>): interfaces.Next<any> {
    return (args: interfaces.NextArgs) => {
        let nextContextInterceptor = args.contextInterceptor;
        args.contextInterceptor = (context: interfaces.Context) => {
            console.log(context);
            return nextContextInterceptor(context);
        };
        return planAndResolve(args);
    };
}
```

## 自定义元数据(matadata)读取器

::: ⚠️
请注意，我们其实不建议您创建自定义元数据读取器。我们添加该特性是为了让库/框架的开发者能够具备更高级的定制权限，但一般用户不应该使用这个特性。通常来说，只有在开发框架时才应该使用自定义元数据读取器，从而为用户提供变更便利的注释API。

如果您正在开发一个框架或者库并常见了自定义元数据读取器，请记得为您的框架添加所有默认装饰器API的替代方法：`@injectable`、`@inject`、`@multiInject`、`@tagged`、`@named`、`@named`、`@optional`、`@targetName`和`@unmanaged`
:::

中间件允许您拦截一个规划(plan)阶段并解析(resolve)，但是不允许您更改注释(annotation)阶段的行为方式。

另一个可扩展的地方是允许您决定使用哪种注释(annotation)系统。默认的注释系统由装饰器和reflect-matadata组成：

```ts
@injectable()
class Ninja implements Ninja {

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(
        @inject("Katana") katana: Katana,
        @inject("Shuriken") shuriken: Shuriken
    ) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

您可以使用自定义元数据读取器来实现自定义注释系统。

例如，您可以实现一个基于静态属性的注释系统：

```ts
class Ninja implements Ninja {

    public static constructorInjections = [
        "Katana", "Shuriken"
    ];

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(
        katana: Katana,
        shuriken: Shuriken
    ) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}
```

自定义元数据必须实现`interfaces.MetadataReader`接口。

您可以在[单元测试](https://github.com/inversify/InversifyJS/blob/master/test/features/metadata_reader.test.ts)中找到完整的示例。

一旦您自定义了元数据阅读器，就需要准备好应用它：

```ts
let container = new Container();
container.applyCustomMetadataReader(new StaticPropsMetadataReader());
```

