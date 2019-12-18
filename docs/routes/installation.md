---
title: 安装
---

## 流程

项目终端输入：

```bash
$ npm install inversify reflect-metadata --save
```

InversifyJS 的类型定义已经包含在npm包当中。

::: warning 警告⚠️
InversifyJS 需要TypeScript 的版本 2.0+，同时需要在`tsconfig`做出如下配置
:::

```json
{
    "compilerOptions": {
        "target": "es5",
        "lib": ["es6"],
        "types": ["reflect-metadata"],
        "module": "commonjs",
        "moduleResolution": "node",
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

此外，InversifyJS 还需要您的 JavaScript 引擎能够支持：

- [Reflect metadata](https://rbuckton.github.io/reflect-metadata/)
- [Map](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise) 
- [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

如果您的环境对以上特性的支持性不好，请引入 `shim` 或 `polyfill`

::: warning ⚠️
`reflect-metadata`的`polyfill`在您的整个应用中应该仅引入一次，因为`Reflect`对象是一个全局单例。更多细节请参考[这里](https://github.com/inversify/InversifyJS/issues/262#issuecomment-227593844)
:::

[这里](https://github.com/inversify/InversifyJS/blob/master/wiki/environment.md)展示了环境支持情况和`polyfill`，以及一些[基本示例](https://github.com/inversify/inversify-basic-example)以供学习。
