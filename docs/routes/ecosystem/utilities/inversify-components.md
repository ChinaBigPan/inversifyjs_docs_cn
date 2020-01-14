# inversify-components

[原文链接](https://github.com/webcomputing/inversify-components)

位于InversifyJS上层的小框架，支持基于组件的依赖注入。每个组件以描述符来描述接口和绑定，并且不会直接访问依赖注入容器。它让您能够：

- 开发松散耦合且独立的组件，无需开发整个依赖注入容器。
- 在应用中启用/禁用/模拟整个组件。
- 使用限定作用域的子容器，比方说仅将依赖项绑定到http请求。
- 可以从其他组件实现“插件式”扩展。

## 安装

通过npm安装：

```bash
npm i --save inversify-components
```

## 使用

### 基本安装改善

1. 创建 inversify-components 容器：

```ts
import { ContainerImpl } from "inversify-components";
let container = new ContainerImpl();
```

2. 创建你自己的主要应用，以作为[总体的根](http://blog.ploeh.dk/2011/07/28/CompositionRoot/)组件：

```ts
import { MainApplication } from "inversify-components";

class App implements MainApplication {
  execute(container: Container) {
    // Start your application using the container!
  }
}
```

3. 注册你想使用的组件：

```ts
import { descriptor } from "my-component-descriptor";
container.componentRegistry.addFromDescriptor(descriptor);
```

4. 注册所有已注册组件描述符的所有绑定

```ts
container.componentRegistry.autobind(container.inversifyInstance);
```

5. 可选项：配置您的组件

```ts
container.componentRegistry.lookup(nameOfComponent).addConfiguration({
  configurationKey: "configurationValue"
});
```

6. 启动应用

```ts
container.setMainApplication(new App());
container.runMain();
```

### 组件和组件描述符

`inversify-components`允许您将应用拆分为独立的组件。为此，每个组件都会导出其组件描述符:

```ts
import { ComponentDescriptor } from "inversify-components";

export const descriptor: ComponentDescriptor = {
  name: "name-of-component", // This must be unique for all registered components
  bindings: {
    root: (bindService, lookupService) => {
      // Binding of services is very similar to inversifyJS:
      bindService.bindGlobalService<TypeOfService>("service-name").to(MyServiceClass);
      
      // MyServiceClass is now bound to "name-of-component:service-name" and available in all other components.
    }
  }
};
```

注意，每个绑定都以唯一的组件名作为前缀。这确保了在所有注册的组件之间不会发生重复的服务绑定。

**获取inversify容器**

您可以通过`ComponentDescriptor`获取inversify容器。

```ts
import { ComponentDescriptor } from "inversify-components";

export const descriptor: ComponentDescriptor = {
  name: "name-of-component", // 这一项对于所有的注册组件来说必须是独一无二的
  bindings: {
    root: (bindService, lookupService, inversifyContainer) => {
      // Unbind something..
      inversifyContainer.unbind("service");

      bindService.bindGlobalService<TypeOfService>("service-name").to(MyServiceClass);
    }
  }
};
```

因此，如果需要的话，在依赖中的描述符总是可以完全控制的。

**更改绑定的作用域**

上面的组件描述符绑定的是根作用域。这是`inversify-components`的默认作用域，会在自动绑定时执行。您也能够为特定作用域注册绑定，并在应用运行时将该作用域的执行安排在特定时间点执行：

```ts
import { ComponentDescriptor } from "inversify-components";

export const descriptor: ComponentDescriptor = {
  name: "name-of-component",
  bindings: {
    root: (bindService, lookupService) => {
      bindService.bindGlobalService<TypeOfService>("service-name").to(MyServiceClass);
    }
    request: (bindService, lookupService) => {
      // Is not available at application start, but as soon as you open your "request" scope:
      bindService.bindGlobalService<TypeOfService>("current-session").toDynamicValue(....);
    }
  }
};

// In your MainApplication / App, as soon as you would like to open the above "request" scope:
// 1) Create inversify child container
let scopedRequestContainer = container.inversifyInstance.createChild();

// 2) Possibly bind some dependent values to this container, e. g. the current request headers and body:
scopedRequestContainer.bind("request-body").toConstantValue(currentRequestBody);

// 3) Execute scoped "request" bindings in this container
container.componentRegistry.autobind(scopedRequestContainer, [], "request");

// 4) Go on in your compoisiton root with child container
scopedRequestContainer.get(...) // Maybe your request handler?
```

**使用扩展点**

要启用组件内的插件，您可以定义*扩展点(extension point)*。我们可以通过Symbol来实现。

组件A: 该组件拥有扩展点，并且想要加载插件：

```ts
import { ComponentDescriptor } from "inversify-components";
import { injectable, multiInject, optional } from "inversify";

const myExtensionPoints = {
  "firstExtensionPoint": Symbol("first-extension-point")
}

export const descriptor: ComponentDescriptor = {
  name: "component-a",
  
  // Register all available extension points
  interfaces: myExtensionPoints
};

@injectable()
class ClassUsingPlugins {
  // Now you can just inject all plugins registered at firstExtensionPoint and use them:
  constructor(@optional() @multiInject(myExtensionPoints.firstExtensionPoint) plugins) {
    this.plugins = plugins;
  }
}
```

组件B：该组件将一个插件加入扩展点`firstExtensionPoint`:

```ts
export const descriptor: ComponentDescriptor = {
  name: "component-b",
  bindings: {
    root: (bindService, lookupService) => {
      let extensionPoint = lookupService.lookup("component-a").getInterface("firstExtensionPoint");
      bindService.bindExtension<ExtensionType>(extensionPoint).to(MyPluginClass);
    }
  }
};
```

**配置**

[这里](https://gist.github.com/antoniusostermann/a6cc1bb2056404682a827735b17df32a)描述了配置组件的基本风格。它能让您轻松定义默认和所需的配置项。

**设置默认配置**

您可以通过添加自己的描述符的方式来给组件设置默认配置。

```ts
const configuration: Configuration.Default = {
  "configurationKey": "configurationValue";
};

export const descriptor: ComponentDescriptor<Configuration.Default> = {
  name: "my-component-name",
  defaultConfiguration: configuration
}
```

**注入配置值**

您可以在你的所有类当中注入组件的元数据(meta data)，其中包含组件的配置：

```ts
import { inject, injectable } from "inversify";
import { Component } from "inversify-components";

@injectable()
class MyClass {
  constrcutor(@inject("meta:component//my-component-name") component: Component<Configuration.Runtime>)
    this.configuration = this.component.configuration;
  }
}
```



