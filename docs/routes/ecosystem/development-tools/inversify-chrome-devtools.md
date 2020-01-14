# inversify-chrome-devtools

## 安装

您可以到Chrome商店找到该扩展插件

## 设置

您可以使用全局方法`__inversifyDevtools__`将InversifyJS的`Kernel`实例连接到Devtools：

```ts
/// <reference path="node_modules/inversify-dts/inversify/inversify.d.ts"/>

import { Kernel } from "inversify";

let kernel = new Kernel();

let win: any = window;

if (win.__inversifyDevtools__) {
    win.__inversifyDevtools__(kernel);
}
```

全局方法`__inversifyDevtools__`仅在**chrome扩展已经安装**的情况下才能够使用。