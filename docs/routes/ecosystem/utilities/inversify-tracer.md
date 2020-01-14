# inversify-tracer

[原文地址](https://github.com/tiagomestre/inversify-tracer)

它是方便开发者追踪由InversifyJS创建的对象方法的工具。

## 安装

您可以使用npm进行安装：

```bash
npm install --save inversify-tracer
```

## 示例


```ts
import 'reflect-metadata';
import { decorate, injectable, Container } from 'inversify';
import { InversifyTracer, CallInfo, ReturnInfo } from './../src';

class Ninja  {

    public attack(force: number): number {
        return 32 * force;
    }

    public slowAttack(force: number, time: number): Promise<number> {

        return new Promise((resolve) => {

            setTimeout(() => {
                resolve(this.attack(force));
            }, time);
        });
    }
}

decorate(injectable(), Ninja);

const container = new Container();

container.bind<Ninja>('Ninja').to(Ninja);

const tracer = new InversifyTracer();

tracer.on('call', (callInfo: CallInfo) => {
    console.log(`${callInfo.className} ${callInfo.methodName} called with ${JSON.stringify(callInfo.parameters)}`);
});

tracer.on('return', (returnInfo: ReturnInfo) => {
    console.log(`${returnInfo.className} ${returnInfo.methodName} returned ${returnInfo.result} - ${returnInfo.executionTime}ms`);
});

tracer.apply(container);

const ninja = container.get<Ninja>('Ninja');

ninja.attack(2);
ninja.slowAttack(4, 1000);
```

打印结果：

```bash
Ninja attack called with [{"name":"force","value":2}]
Ninja attack returned 64 - 0ms
Ninja slowAttack called with [{"name":"force","value":4},{"name":"time","value":1000}]
Ninja attack called with [{"name":"force","value":4}]
Ninja attack returned 128 - 0ms
Ninja slowAttack returned 128 - 1004ms
```

## 配置项

这些配置项可以让您改变tracer的默认行为。它们通过`InversifyTracer`构造函数传入。

```ts
const tracer = new InversifyTracer({
    filters: ["*:*", "!Ninja:*"],
    inspectReturnedPromise: false
});

tracer.apply(container);
```

| 属性 | 类型 | 默认值 | 描述 |
| ---- | ---- | ---- | ----- |
| filters |  string[] | ['*:*'] | 设置需要追踪的类和方法 |
| inspectReturnedPromise | boolean | true | 观察返回的Promise值 |

### Filters

过滤器（filters）的作用是由您来指定需要跟踪的类和/或函数。默认跟踪所有的类和方法。

**示例：**

```ts
['*:*', '!Ninja:*'] // 追踪除Ninja外的类
['Ninja:*', '!Ninja:hide'] // 追踪Ninja类中的所有方法，hide除外。
['*:attack'] // 追踪所有类中的attack方法
['Nin*:*'] // 追踪所有以 Nin 开头的类中的方法。
```

## 事件

**`call`**

- callInfo\<CallInfo\>

在类方法被调用时会派发。

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| className | string | 类的名字 |
| methodName | string | 方法名 |
| parameters | Parameter[] | 方法的参数及其值的名称数组 |


**`return`**

类方法结束时派发。

- returnInfo\<ReturnInfo\>

| 属性 | 类型 | 描述 |
|---|---|---|
| className | string | 类的名字 |
| methodName | string | 方法名 |
| result | any | 方法的返回值 |
| executionTime | number |  方法的执行时间（毫秒）|





