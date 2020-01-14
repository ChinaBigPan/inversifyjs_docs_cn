# inversify-express-utils

[原文链接](https://github.com/inversify/inversify-express-utils)

使用InversifyJS开发Express应用的一些实用工具

## 安装

您可以使用npm来安装`inversify-express-utils`：

```bash
npm install inversify inversify-express-utils reflect-metadata --save
```

`inversify-express-utils`的类型定义已经包含至npm模块中，需要TypeScript版本 > 2.0

## 基础

**第一步：装饰你的控制器**

想要将类作为Express的“控制器(controller)”，只需要将`@controller`装饰器添加到类中即可。同理我们可以将类的方法作为请求句柄进行修饰。

下面的示例展示了如何声明一个控制器来处理`GET /foo`请求：

```ts
import * as express from "express";
import { interfaces, controller, httpGet, httpPost, httpDelete, request, queryParam, response, requestParam } from "inversify-express-utils";
import { injectable, inject } from "inversify";

@controller("/foo")
export class FooController implements interfaces.Controller {

    constructor( @inject("FooService") private fooService: FooService ) {}

    @httpGet("/")
    private index(req: express.Request, res: express.Response, next: express.NextFunction): string {
        return this.fooService.get(req.query.id);
    }

    @httpGet("/")
    private list(@queryParam("start") start: number, @queryParam("count") count: number): string {
        return this.fooService.get(start, count);
    }

    @httpPost("/")
    private async create(@request() req: express.Request, @response() res: express.Response) {
        try {
            await this.fooService.create(req.body);
            res.sendStatus(201);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    @httpDelete("/:id")
    private delete(@requestParam("id") id: string, @response() res: express.Response): Promise<void> {
        return this.fooService.delete(id)
            .then(() => res.sendStatus(204))
            .catch((err: Error) => {
                res.status(400).json({ error: err.message });
            });
    }
}
```

**第二步：配置您的容器和服务**

像往常一样配置您的inversify容器。

接下来，将容器传入`InversifyExpressServer`构造器。这样就把容器中所有的控制器和依赖都进行了注册，并附加到express应用中。然后调用`server.build()`来准备应用程序。

为了让`InversifyExpressServer`能够找到您的控制器，您必须将其绑定到`TYPE.Controller`服务标识符并用控制器的名称作为绑定的标签。inversify-express-utils导出的`Controller`接口是空的，只是为了方便，所以如果需要，可以随意实现自己的控制器接口。

```ts
import * as bodyParser from 'body-parser';

import { Container } from 'inversify';
import { interfaces, InversifyExpressServer, TYPE } from 'inversify-express-utils';

// declare metadata by @controller annotation
import "./controllers/foo_controller";

// set up container
let container = new Container();

// set up bindings
container.bind<FooService>('FooService').to(FooService);

// create server
let server = new InversifyExpressServer(container);
server.setConfig((app) => {
  // add body parser
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
});

let app = server.build();
app.listen(3000);
```

**关于`@controller`装饰器的一些重要信息**

我们已经发布了`inversify-express-util@5.0.0`版本。在这个版本中，在使用了`@controller`注释的类中不必再使用`@injectable`注释了。同样地，在使用`@controller`注释的类中，也不再需要声明控制器的类型绑定。

⚠️ 声明绑定对控制器来说不是必需的，但是需要一次性导入控制器。当控制器文件被导入时(例如，`import "./controllers/some_controller"`)，类被声明，元数据被生成。如果您不导入它，就无法生成元数据，因此也就找不到控制器。可以看[这个示例](https://github.com/inversify/inversify-express-example/blob/master/MongoDB/bootstrap.ts#L10-L11)

如果您在一个共享的运行时程序中(比如，单元测试)多次运行应用，您可能需要在每次测试之前清理现有的元数据。

```ts
import { cleanUpMetadata } from "inversify-express-utils";

describe("Some Component", () => {

    beforeEach(() => {
        cleanUpMetadata();
    });

    it("Some test case", () => {
        // ...
    });

});
```

[这里](https://github.com/inversify/inversify-express-utils/blob/master/test/framework.test.ts#L25-L29)有单元测试示例。

如果应用程序没有控制器，那么`inversify-express-utils`将抛出异常。您可以通过设置`forceControllers`选项来禁用该行为。[这里](https://github.com/inversify/inversify-express-utils/blob/master/test/issue_590.test.ts)有一些关于`forceControllers`的单元测试示例。

## InversifyExpressServer

对express应用的封装。

**`.setConfig(configFn)`**

配置项 —— 暴露express应用对象，以方便加载服务器级别的中间件。

```ts
import * as morgan from 'morgan';
// ...
let server = new InversifyExpressServer(container);

server.setConfig((app) => {
    var logger = morgan('combined')
    app.use(logger);
});
```

**`setErrorConfig(errorConfigFn)`**

配置项 —— 与`.setConfig()`相类似，只是这个函数是在注册所有应用中间件和控制器路由之后进行应用的。

```ts
let server = new InversifyExpressServer(container);
server.setErrorConfig((app) => {
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    });
});
```

**`.build()`**

将所有注册的控制器和中间件连接到express应用。返回应用的实例。

```ts
// ...
let server = new InversifyExpressServer(container);
server
    .setConfig(configFn)
    .setErrorConfig(errorConfigFn)
    .build()
    .listen(3000, 'localhost', callback);
```

## 使用自定义路由

可以将自定义`Router`实例传递给`InversifyExpressServer`：

```ts
let container = new Container();

let router = express.Router({
    caseSensitive: false,
    mergeParams: false,
    strict: false
});

let server = new InversifyExpressServer(container, router);
```

默认情况下，服务器以`/path`路径提供API，不过有时候可能需要使用不同的根命名空间，举例来说如果规定所有的路由都应该以`/api/v1`开头。我们可以通过路由配置将该设置传递给`InversifyExpressServer`

```ts
let container = new Container();

let server = new InversifyExpressServer(container, null, { rootPath: "/api/v1" });
```

## 使用自定义express应用

可以向`InversifyExpressServer`传递自定义的`express.Application`实例：

```ts
let container = new Container();

let app = express();
//Do stuff with app

let server = new InversifyExpressServer(container, null, null, app);
```

## 内置装饰器说明

**`@controller(path, [middleware, ...])`**

将所装饰的类注册为具有根路径的控制器，并且可以为该控制器注册任意的全局中间件。

**`@httpMethod(method, path, [middleware, ...])`**

将所装饰的控制器方法注册为特定路径和请求方式的请求句柄，需要注意的是方法名应该是合法的express路由方法。

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

将方法参数绑定到request.body。如果express应用中没有使用bodyParser中间件，那么该方法将把参数绑定到express请求对象上。

**`@requestHeaders(name: string)`**

将方法参数绑定到请求头。

**`cookies(name: string)`**

将方法参数绑定到请求cookies。

**`@next()`**

将方法参数绑定到`next`函数。

**`@principal()`**

将方法参数绑定到从AuthProvider获得的用户主体。

## BaseHttpController

`BaseHttpController`是一个基类，它内置了很多辅助函数，用以帮助编写可测试的控制器。当从我们获得从这些控制器中定义的方法所返回的响应时，您可以使用下面将要介绍的`httpContext`属性上可用的`response`对象，或是返回一个`HttpResponseMessage`,亦或是返回一个实现`IHttpActionResult`接口的对象。

后两种方法的好处是：因为你的控制器对请求`httpContext`发送一个响应不在是直接耦合了，所以不必模拟整个响应对象，您可以简单地在返回值上运行断言。此外，整个API还允许我们在这一领域进行进一步改进，同时添加一些相似框架(如 .NET WebAPI)的功能，如媒体格式化、内容协商等等。

```ts
import { injectable, inject } from "inversify";
import {
    controller, httpGet, BaseHttpController, HttpResponseMessage, StringContent
} from "inversify-express-utils";

@controller("/")
class ExampleController extends BaseHttpController {
    @httpGet("/")
    public async get() {
        const response = new HttpResponseMessage(200);
        response.content = new StringContent("foo");
        return response;
    }
```

在`BaseHttpController`上，我们提供了成吨的辅助方法来简化返回常见IHttpActionResults的过程，包括

- OkResult
- OkNegotiatedContentResult
- RedirectResult
- ResponseMessageResult
- StatusCodeResult
- BadRequestErrorMessageResult
- BadRequestResult
- ConflictResult
- CreatedNegotiatedContentResult
- ExceptionResult
- InternalServerError
- NotFoundResult
- JsonResult

```ts
import { injectable, inject } from "inversify";
import {
    controller, httpGet, BaseHttpController
} from "inversify-express-utils";

@controller("/")
class ExampleController extends BaseHttpController {
    @httpGet("/")
    public async get() {
        return this.ok("foo");
    }
}
```

**JsonResult**

在某些场景中，需要设置一下响应的状态码。可以通过使用`BaseHttpController`所提供的json辅助方法来实现。

```ts
import {
    controller, httpGet, BaseHttpController
} from "inversify-express-utils";

@controller("/")
export class ExampleController extends BaseHttpController {
    @httpGet("/")
    public async get() {
        const content = { foo: "bar" };
        const statusCode = 403;

        return this.json(content, statusCode);
    }
}
```

这就让灵活地创建自定义响应成为可能，同时还能保持单元测试的简单性。

```ts
import { expect } from "chai";

import { ExampleController } from "./example-controller";
import { results } from "inversify-express-utils";

describe("ExampleController", () => {
    let controller: ExampleController;

    beforeEach(() => {
        controller = new ExampleController();
    });

    describe("#get", () => {
        it("should have a status code of 403", async () => {
            const response = await controller.get();

            expect(response).to.be.an.instanceof(results.JsonResult);
            expect(response.statusCode).to.equal(403);
        });
    });
});
```

本示例使用了[Mocha](https://mochajs.org/)和[Chai](http://www.chaijs.com/)作为单元测试框架。

## HttpContext

`HttpContext`属性方便我们访问当前请求、响应和用户信息。`HttpContext`是`BaseHttpController`派生的控制器中的一个属性。

```ts
import { injectable, inject } from "inversify";
import {
    controller, httpGet, BaseHttpController
} from "inversify-express-utils";

@controller("/")
class UserPreferencesController extends BaseHttpController {

    @inject("AuthService") private readonly _authService: AuthService;

    @httpGet("/")
    public async get() {
        const token = this.httpContext.request.headers["x-auth-token"];
        return await this._authService.getUserPreferences(token);
    }
}
```

如果您想要创建自定义控制器，您需要使用`@injectHttpContext`装饰器手动注入`HttpContext`。

```ts
import { injectable, inject } from "inversify";
import {
    controller, httpGet, BaseHttpController, httpContext, interfaces
} from "inversify-express-utils";

const authService = inject("AuthService")

@controller("/")
class UserPreferencesController {

    @injectHttpContext private readonly _httpContext: interfaces.HttpContext;
    @authService private readonly _authService: AuthService;

    @httpGet("/")
    public async get() {
        const token = this.httpContext.request.headers["x-auth-token"];
        return await this._authService.getUserPreferences(token);
    }
}
```

## AuthProvider

如果不创建自定义的`AuthProvider`实现的话，`HttpContext`将无法访问当前用户。

```ts
const server = new InversifyExpressServer(
    container, null, null, null, CustomAuthProvider
);
```

我们需要实现一下`AuthProvider`接口。

`AuthProvider`允许我们获取用户的主体(`Principal`);

```ts
import { injectable, inject } from "inversify";
import { interfaces } from "inversify-express-utils";

const authService = inject("AuthService");

@injectable()
class CustomAuthProvider implements interfaces.AuthProvider {

    @authService private readonly _authService: AuthService;

    public async getUser(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ): Promise<interfaces.Principal> {
        const token = req.headers["x-auth-token"]
        const user = await this._authService.getUser(token);
        const principal = new Principal(user);
        return principal;
    }

}
```

当然`Principal`接口也需要我们亲自操刀。它要满足的功能包括：

- 访问用户的详细信息。
- 检查其对某些资源的访问权限。
- 检查其是否经过验证。
- 检查其是否在用户角色中。

```ts
class Principal implements interfaces.Principal {
    public details: any;
    public constructor(details: any) {
        this.details = details;
    }
    public isAuthenticated(): Promise<boolean> {
        return Promise.resolve(true);
    }
    public isResourceOwner(resourceId: any): Promise<boolean> {
        return Promise.resolve(resourceId === 1111);
    }
    public isInRole(role: string): Promise<boolean> {
        return Promise.resolve(role === "admin");
    }
}
```

接下来我们就可以通过`HttpContext`来访问当前用户的主体(Principal)：

```ts
@controller("/")
class UserDetailsController extends BaseHttpController {

    @inject("AuthService") private readonly _authService: AuthService;

    @httpGet("/")
    public async getUserDetails() {
        if (this.httpContext.user.isAuthenticated()) {
            return this._authService.getUserDetails(this.httpContext.user.details.id);
        } else {
            throw new Error();
        }
    }
}
```

## BaseMiddleware

对`BaseMiddleware`的扩展将允许我们在Express的中间件函数内注入依赖并访问当前的`HttpContext`。

```ts
import { BaseMiddleware } from "inversify-express-utils";

@injectable()
class LoggerMiddleware extends BaseMiddleware {
    @inject(TYPES.Logger) private readonly _logger: Logger;
    public handler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (this.httpContext.user.isAuthenticated()) {
            this._logger.info(`${this.httpContext.user.details.email} => ${req.url}`);
        } else {
            this._logger.info(`Anonymous => ${req.url}`);
        }
        next();
    }
}
```

我们还需要声明一些类型绑定：

```ts
const container = new Container();

container.bind<Logger>(TYPES.Logger)
        .to(Logger);

container.bind<LoggerMiddleware>(TYPES.LoggerMiddleware)
         .to(LoggerMiddleware);
```

接着我们就可以将`TYPES.LoggerMiddleware`注入我们的控制器中了：

```ts
@injectable()
@controller("/")
class UserDetailsController extends BaseHttpController {

    @inject("AuthService") private readonly _authService: AuthService;

    @httpGet("/", TYPES.LoggerMiddleware)
    public async getUserDetails() {
        if (this.httpContext.user.isAuthenticated()) {
            return this._authService.getUserDetails(this.httpContext.user.details.id);
        } else {
            throw new Error();
        }
    }
}

container.bind<interfaces.Controller>(TYPE.Controller)
         .to(UserDetailsController)
         .whenTargetNamed("UserDetailsController");
```

**请求范围服务**

扩展`BaseMiddleware`的中间件能够在HTTP请求范围内重新绑定服务。如果您需要访问服务中的HTTP请求或是服务中无法直接访问的特定上下文属性，那么这个功能就是为你准备的了。

来看一下下面的`TracingMiddleware`中间件。在本示例中，我们希望从传入的请求中捕获`X-Trace-Id`报头，并将其作为`TYPES.TraceIdValue`提供给IoC服务。

```ts
import { inject, injectable } from "inversify";
import { BaseHttpController, BaseMiddleware, controller, httpGet } from "inversify-express-utils";
import * as express from "express";

const TYPES = {
    TraceId: Symbol.for("TraceIdValue"),
    TracingMiddleware: Symbol.for("TracingMiddleware"),
    Service: Symbol.for("Service"),
};

@injectable()
class TracingMiddleware extends BaseMiddleware {

    public handler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        this.bind<string>(TYPES.TraceIdValue)
            .toConstantValue(`${ req.header('X-Trace-Id') }`);

        next();
    }
}

@controller("/")
class TracingTestController extends BaseHttpController {

    constructor(@inject(TYPES.Service) private readonly service: Service) {
        super();
    }

    @httpGet(
        "/",
        TYPES.TracingMiddleware
    )
    public getTest() {
        return this.service.doSomethingThatRequiresTheTraceID();
    }
}

@injectable()
class Service {
    constructor(@inject(TYPES.TraceIdValue) private readonly traceID: string) {
    }

    public doSomethingThatRequiresTheTraceID() {
        // ...
    }
}
```

`BaseMiddleware.bind()`方法将：

- 绑定`TYPES.TraceIdValue`(如果还没有绑定)。
- 重新绑定`TYPES.TraceIdValue`(如果已经绑定)。

## 路由映射

如果我们有和下面类似情况的控制器：

```ts
@controller("/api/user")
class UserController extends BaseHttpController {
    @httpGet("/")
    public get() {
        return {};
    }
    @httpPost("/")
    public post() {
        return {};
    }
    @httpDelete("/:id")
    public delete(@requestParam("id") id: string) {
        return {};
    }
}

@controller("/api/order")
class OrderController extends BaseHttpController {
    @httpGet("/")
    public get() {
        return {};
    }
    @httpPost("/")
    public post() {
        return {};
    }
    @httpDelete("/:id")
    public delete(@requestParam("id") id: string) {
        return {};
    }
}
```

我们可以使用`prettyjson`函数来查看所有可用的端点：

```ts
import { getRouteInfo } from "inversify-express-utils";
import * as prettyjson from "prettyjson";

// ...

let server = new InversifyExpressServer(container);
let app = server.build();
const routeInfo = getRouteInfo(container);

console.log(prettyjson.render({ routes: routeInfo }));

// ...
```

::: warning
请确保在调用`server.build()`之后调用`getRouteInfo`嗷!
:::

`prettyjson`的输出格式如下：

```bash
routes:
  -
    controller: OrderController
    endpoints:
      -
        route: GET /api/order/
      -
        route: POST /api/order/
      -
        path: DELETE /api/order/:id
        route:
          - @requestParam id
  -
    controller: UserController
    endpoints:
      -
        route: GET /api/user/
      -
        route: POST /api/user/
      -
        route: DELETE /api/user/:id
        args:
          - @requestParam id

```

## 示例

这里有一些[示例](https://github.com/inversify/inversify-express-example)可供参考。






