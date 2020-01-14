# inversify-devtools

由React/Redux开发的InversifyJS浏览器开发工具。

![image](/images/inversify-devtools.png)

## 如何使用？

> 注意:此项目包含一个用于增强浏览器扩展的web应用。如果您寻找浏览器扩展: 
> 那么请访问: [inversify-chrome-devtools](/routes/ecosystem/inversify-chrome-devtools)

您可以使用npm进行安装：

```bash
npm install --save inversify-devtools
npm install --save-dev inversify-dts
```

这里您可以使用`connectKernel`方法来将`Kernel`类的实例连接到开发工具：

```ts
/// <reference path="node_modules/inversify-dts/inversify-devtools/inversify-devtools.d.ts"/>

import render from "inversify-devtools";
import { Kernel } from "inversify";

let containerId = "root";
let connectKernel = render(containerId);
let kernel = new Kernel();
connectKernel(kernel);
```