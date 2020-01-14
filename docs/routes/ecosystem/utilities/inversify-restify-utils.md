# inversify-restify-utils

[原文链接](https://github.com/inversify/inversify-restify-utils)

一些方便使用InversifyJS开发REST应用的工具。

## 安装

您可以使用npm来安装`inversify-restify-utils`：

```bash
npm install inversify inversify-restify-utils reflect-metadata --save
```

`inversify-restify-utils`类型定义包含在了npm模块中，TypeScript版本要求是2.0以上。请参阅[InversifyJS文档](https://github.com/inversify/InversifyJS#installation)以了解更多关于安装过程的信息。

## 基础

**第一步：装饰您的控制器**

要想将类作为REST应用的“控制器”，只需向类中添加`@Controller`装饰器即可。同理可将类的方法修饰为请求句柄。下面的示例展示的是声明`GET /foo`的控制器：

```ts
import { Request } from 'restify';
import { Controller, Get, interfaces } from 'inversify-restify-utils';
import { injectable, inject } from 'inversify';

@Controller('/foo')
@injectable()
export class FooController implements interfaces.Controller {
    
    constructor( @inject('FooService') private fooService: FooService ) {}
    
    @Get('/')
    private index(req: Request): string {
        return this.fooService.get(req.query.id);
    }
}
```

**第二步：配置容器和服务器**

像往常一样在您的根文件中配置反转容器。

接下来，将容器传入`InversifyRestifyServer`构造器中。这样就将容器中所有的控制器及其依赖项进行了注册，并将其附加到REST应用中。接下来调用`server.build()`启动服务。

为了确保`InversifyRestifyServer`能够找到你的控制器，请务必绑定`TYPE.Controller`并将控制器名称作为其标签。本框架导出的`Controller`接口其实是空的，仅仅为了方便开发，如果您想配置您自己的接口也没有问题。

```ts
import { Container } from 'inversify';
import { interfaces, InversifyRestifyServer, TYPE } from 'inversify-restify-utils';

// set up container
let container = new Container();

// note that you *must* bind your controllers to Controller 
container.bind<interfaces.Controller>(TYPE.Controller).to(FooController).whenTargetNamed('FooController');
container.bind<FooService>('FooService').to(FooService);

// create server
let server = new InversifyRestifyServer(container);

let app = server.build();
app.listen(3000);
```

服务器配置项可以作为第二个参数传入`InversifyRestifyServer`构造器：

```ts
let server = new InversifyRestifyServer(container, { name: "my-server" });
```

其中可以配置`defaultRoot`来定义所有控制器的默认路径：

```ts
let server = new InversifyRestifyServer(container, { name: "my-server", defaultRoot: "/v1" });
```

## InversifyRestifyServer

它是对REST服务的封装。

**`.setConfig(configFn)`**

配置项 —— 暴露REST应用对象，以方便加载服务器级别的中间件。

```ts
import * as morgan from 'morgan';
// ...
let server = new InversifyRestifyServer(container);
server.setConfig((app) => {
    var logger = morgan('combined')
    app.use(logger);
});
```

**`.build()`**

将所有注册的控制器和中间件连接到REST应用。返回应用的实例。

```ts
// ...
let server = new InversifyRestifyServer(container);
server
    .setConfig(configFn)
    .build()
    .listen(3000, 'localhost', callback);
```

## 装饰器

**`@Controller(path, [middleware, ...])`**

将所装饰的类注册为具有根路径的控制器，并且可以为该控制器注册任意的全局中间件。

**`@Method(method, path, [middleware, ...])`**

将所装饰的控制器方法注册为特定路径和请求方式的请求句柄，需要注意的是方法名应该是合法的REST路由方法。 

**`@SHORTCUT(path, [middleware, ...])`**

Shortcut装饰器是对`@httpMethod`的简单封装。它包括了`@Get`,`@Post`、`@Put`、`@Patch`、`@Head`、`@Delete`和`@Options`。如果想要这之外的功能，请使用`Method`（或者给我们提个PR 😄）。

## 中间件

中间件可以是`restify.RequestHandler`的实例，也可以是InversifyJS服务标识符。

使用中间件最简单的方法是定义`restify.RequestHandler`实例并将句柄作为装饰器参数传入。

```ts
// ...
const loggingHandler = (req: restify.Request, res: restify.Response, next: restify.Next) => {
  console.log(req);
  next();
};

@Controller('/foo', loggingHandler)
@injectable()
export class FooController implements interfaces.Controller {
    
    constructor( @inject('FooService') private fooService: FooService ) {}
    
    @Get('/', loggingHandler)
    private index(req: restify.Request): string {
        return this.fooService.get(req.query.id);
    }
}
```

但是，如果您希望充分利用InversifyJS，可以将相同的句柄绑定到IOC容器，并将其服务标识符传递给装饰器。

```ts
// ...
import { TYPES } from 'types';
// ...
const loggingHandler = (req: restify.Request, res: restify.Response, next: restify.Next) => {
  console.log(req);
  next();
};
container.bind<restify.RequestHandler>(TYPES.LoggingMiddleware).toConstantValue(loggingHandler);
// ...
@Controller('/foo', TYPES.LoggingMiddleware)
@injectable()
export class FooController implements interfaces.Controller {
    
    constructor( @inject('FooService') private fooService: FooService ) {}
    
    @Get('/', TYPES.LoggingMiddleware)
    private index(req: restify.Request): string {
        return this.fooService.get(req.query.id);
    }
}
```




