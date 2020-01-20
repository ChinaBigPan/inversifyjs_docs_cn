# inversify-logger-middleware

为InversifyJS开发的基本日志中间件。

![image](/inversifyjs_docs_cn/images/inversify-logger-middleware.png);

## 安装

你可以使用安装`inversify-logger-middleware`：

```bash
npm install inversify inversify-logger-middleware reflect-metadata --save
```

`inversify-logger-middleware`类型定义包含在了npm模块中，TypeScript版本要求是2.0以上。请参阅[InversifyJS文档](https://github.com/inversify/InversifyJS#installation)以了解更多关于安装过程的信息。

### 动机

假设我们已经使用以下绑定配置了InversifyJS容器和logger中间件:

```ts
let module = new ContainerModule((bind: inversify.interfaces.Bind) => {
    bind<Weapon>("Weapon").to(Katana).whenInjectedInto(Samurai);
    bind<Weapon>("Weapon").to(Shuriken).whenInjectedInto(Ninja);
    bind<Warrior>("Warrior").to(Samurai).whenTargetTagged("canSneak", false);
    bind<Warrior>("Warrior").to(Ninja).whenTargetTagged("canSneak", true);
});
```

该中间件将在控制台中用以下格式展示InversifyJS解决方案。

```bash
//  container.getTagged<Warrior>("Warrior", "canSneak", true);

SUCCESS: 0.41 ms.
    └── Request : 0
        └── serviceIdentifier : Warrior
        └── bindings
            └── Binding<Warrior> : 0
                └── type : Instance
                └── implementationType : Ninja
                └── scope : Transient
        └── target
            └── serviceIdentifier : Warrior
            └── name : undefined
            └── metadata
                └── Metadata : 0
                    └── key : canSneak
                    └── value : true
        └── childRequests
            └── Request : 0
                └── serviceIdentifier : Weapon
                └── bindings
                    └── Binding<Weapon> : 0
                        └── type : Instance
                        └── implementationType : Shuriken
                        └── scope : Transient
                └── target
                    └── serviceIdentifier : Weapon
                    └── name : shuriken
                    └── metadata
                        └── Metadata : 0
                            └── key : name
                            └── value : shuriken
                        └── Metadata : 1
                            └── key : inject
                            └── value : Weapon
```

您可以通过配置来决定哪些元素可以用来显示解析计划。

这些信息的类型会在开发过程中祝您一臂之力。

### 默认设置和渲染

您可以向下面这样创建默认的日志：

```ts
import { makeLoggerMiddleware } from 'inversify-logger-middleware';
let logger = makeLoggerMiddleware();
```

默认设置如下：

```ts
let deatultOptions: LoggerSettings = {
    request: {
        bindings: {
            activated: false,
            cache: false,
            constraint: false,
            dynamicValue: false,
            factory: false,
            implementationType: true,
            onActivation: false,
            provider: false,
            scope: false,
            serviceIdentifier: false,
            type: false
        },
        serviceIdentifier: true,
        target: {
            metadata: true,
            name: false,
            serviceIdentifier: false
        }
    },
    time: true
};
```

您可以通过这些配置项来决定日志的展示项目。

默认渲染到控制台的形式是这样的：

```ts
function consoleRenderer(out: string) {
    console.log(out);
}
```

自定义设置和渲染方法：

下面的代码片段使用了自定义设置，并且使用了新的渲染方法：

```ts
let options: LoggerSettings = {
    request: {
        serviceIdentifier: true,
        bindings: {
            scope: true
        },
        result: true
    }
};

// Takes object (loggerOutput) instead of primitive (string) to share reference
let makeStringRenderer = function (loggerOutput: { content: string }) {
    return function (out: string) {
        loggerOutput.content = out;
    };
};


let loggerOutput = { content : "" };
let stringRenderer = makeStringRenderer(loggerOutput);
let logger = makeLoggerMiddleware(null, stringRenderer);
```

### 使用中间件

您可以根据InversifyJS的API来部署中间件：

```ts
let container = new Container();
let logger = makeLoggerMiddleware();
container.applyMiddleware(logger);
```


### Demo

[这里](https://github.com/inversify/inversify-code-samples/tree/master/inversify-binding-decorators)有一些demo可供参考。

