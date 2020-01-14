# inversify-koa-utils

[原文链接](https://github.com/diego-d5000/inversify-koa-utils)

使用InversifyJS开发Koa应用的一些实用工具

::: warning
本框架并非官方文档中的框架，为译者搜索并添加，请知悉。
:::

`inversify-koa-utils`是基于`inversify-express-utils`开发的模块，主要用于在Koa2应用开发过程中通过InversifyJS实现使用装饰器和IoC依赖注入功能。

## 安装

```bash
npm install inversify inversify-koa-utils reflect-metadata --save
```

`inversify-koa-utils`的类型定义已经包含至npm模块中，需要TypeScript版本 > 2.0

## 基础

**第一步：装饰你的控制器**

想要将类作为Koa应用的“控制器(controller)”，只需要将`@controller`装饰器添加到类中即可。同理我们可以将类的方法作为请求句柄进行修饰。

下面的示例展示了如何声明一个控制器来处理`GET /foo`请求：

```ts
import * as Koa from 'koa';
import { interfaces, Controller, Get, Post, Delete } from 'inversify-koa-utils';
import { injectable, inject } from 'inversify';

@controller('/foo')
@injectable()
export class FooController implements interfaces.Controller {

    constructor( @inject('FooService') private fooService: FooService ) {}

    @httpGet('/')
    private index(ctx: Router.IRouterContext , next: () => Promise<any>): string {
        return this.fooService.get(ctx.query.id);
    }

    @httpGet('/basickoacascading')
    private koacascadingA(ctx: Router.IRouterContext, nextFunc: () => Promise<any>): string {
        const start = new Date();
        await nextFunc();
        const ms = new Date().valueOf() - start.valueOf();
        ctx.set("X-Response-Time", `${ms}ms`);
    }

    @httpGet('/basickoacascading')
    private koacascadingB(ctx: Router.IRouterContext , next: () => Promise<any>): string {
        ctx.body = "Hello World";
    }

    @httpGet('/')
    private list(@queryParams('start') start: number, @queryParams('count') cound: number): string {
        return this.fooService.get(start, count);
    }

    @httpPost('/')
    private async create(@response() res: Koa.Response) {
        try {
            await this.fooService.create(req.body)
            res.body = 201
        } catch (err) {
            res.status = 400 
            res.body = { error: err.message }
        }
    }

    @httpDelete('/:id')
    private delete(@requestParam("id") id: string, @response() res: Koa.Response): Promise<void> {
        return this.fooService.delete(id)
            .then(() => res.body = 204)
            .catch((err) => {
                res.status = 400
                res.body = { error: err.message }
            })
    }
}
```

**第二步：配置您的容器和服务**

接下来，将容器传入`InversifyKoaServer`构造器。这样就把容器中所有的控制器和依赖都进行了注册，并附加到koa应用中。然后调用`server.build()`来准备应用程序。

为了让`InversifyKoaServer`能够找到您的控制器，您必须将其绑定到`TYPE.Controller`服务标识符并用控制器的名称作为绑定的标签。inversify-koa-utils导出的`Controller`接口是空的，只是为了方便，所以如果需要，可以随意实现自己的控制器接口。

```ts
import * as bodyParser from 'koa-bodyparser';

import { Container } from 'inversify';
import { interfaces, InversifyKoaServer, TYPE } from 'inversify-koa-utils';

// set up container
let container = new Container();

// note that you *must* bind your controllers to Controller
container.bind<interfaces.Controller>(TYPE.Controller).to(FooController).whenTargetNamed('FooController');
container.bind<FooService>('FooService').to(FooService);

// create server
let server = new InversifyKoaServer(container);
server.setConfig((app) => {
  // add body parser
  app.use(bodyParser());
});

let app = server.build();
app.listen(3000);
```

## InversifyKoaServer

对koa应用的封装。

**`.setConfig(configFn)`**

配置项 —— 暴露koa应用对象，以方便加载服务器级别的中间件。

```ts
import * as morgan from 'koa-morgan';
// ...
let server = new InversifyKoaServer(container);

server.setConfig((app) => {
    var logger = morgan('combined')
    app.use(logger);
});
```

**`setErrorConfig(errorConfigFn)`**

配置项 —— 与`.setConfig()`相类似，只是这个函数是在注册所有应用中间件和控制器路由之后应用的。

```ts
let server = new InversifyKoaServer(container);
server.setErrorConfig((app) => {
    app.use((ctx, next) => {
        console.error(err.stack);
        ctx.status = 500
        ctx.body = 'Something broke!';
    });
});
```

**`.build()`**

将所有注册的控制器和中间件连接到koa应用。返回应用的实例。

```ts
// ...
let server = new InversifyKoaServer(container);
server
    .setConfig(configFn)
    .setErrorConfig(errorConfigFn)
    .build()
    .listen(3000, 'localhost', callback);
```

## 使用自定义路由

可以将自定义`Router`实例传递给`InversifyKoaServer`：

```ts
import * as Router from 'koa-router';

let container = new Container();

let router = new Router({
    prefix: '/api',
});

let server = new InversifyKoaServer(container, router);
```

默认情况下，服务器以`/path`路径提供API，不过有时候可能需要使用不同的根命名空间，举例来说如果规定所有的路由都应该以`/api/v1`开头。我们可以通过路由配置将该设置传递给`InversifyKoaServer`

```ts
let container = new Container();

let server = new InversifyKoaServer(container, null, { rootPath: "/api/v1" });
```

## 使用自定义koa应用

可以向`InversifyKoaServer`传递自定义的`koa.Application`实例：

**`@controller(path, [middleware, ...])`**

将所装饰的类注册为具有根路径的控制器，并且可以为该控制器注册任意的全局中间件。

**`@httpMethod(method, path, [middleware, ...])`**

将所装饰的控制器方法注册为特定路径和请求方式的请求句柄，需要注意的是方法名应该是合法的koa路由方法。

**`@SHORTCUT(path, [middleware, ...])`**

Shortcut装饰器是对`@httpMethod`的简单封装。它包括了`@httpGet`,`@httpPost`、`@httpPut`、`@httpPatch`、`@httpHead`、`@httpDelete`和`@All`。如果想要这之外的功能，请使用`@httpMethod`（或者给我们提个PR 😄）。

**`@request()`**

将方法参数绑定到请求对象。

**`@response()`**

将方法参数绑定到响应对象。

**`@requestParam(name: string)`**

将方法参数绑定到`request.params`。如果传入了`name`值，则绑定到对应`name`值的参数。

**`@queryParam(name: string)`**

将方法参数绑定到`request.query`。如果传入了`name`值，则绑定到对应`name`值的查询参数。

**`@requestBody()`**

将方法参数绑定到request.body。如果koa应用中没有使用bodyParser中间件，那么该方法将把参数绑定到koa请求对象上。

**`@requestHeaders(name: string)`**

将方法参数绑定到请求头。

**`cookies(name: string)`**

将方法参数绑定到请求cookies。

**`@next()`**

将方法参数绑定到`next`函数。





