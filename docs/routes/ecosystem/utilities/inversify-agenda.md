# inversify-agenda

[原文链接](https://github.com/lautarobock/inversify-agenda)

为方便[任务调度](https://github.com/agenda/agenda)人员的开发提供的一些辅助方法

> Agenda —— Node.js轻量级任务调度库

## 安装

您可以使用npm进行安装：

```bash
npm i inversify inversify-agenda reflect-metadata --save
```

`inversify-agenda`的类型定义已经包含在npm模块中，并且要求TypeScript版本 > 3。可以参阅[InversifyJS 文档](https://github.com/inversify/InversifyJS#installation)了解更多。

## 预备信息

首先您需要熟悉[agenda](https://github.com/agenda/agenda)这个库。（译者注：我一定会弄一个中文文档的）

## 快速开始

### 步骤1：装饰任务类

所有任务都将由命令类来执行。它需要实现`AgendaTaskCommand`接口，接着由`@task`装饰。`@task`装饰器拥有2个参数，`jobName`和`interval`数组。

```ts
@task('task.sms.searchAndSend', '10 seconds')
export class TasTest implements AgendaTaskCommand {

  constructor(
    private service: Service // will be injected by inversify
  ) { }

  execute(job: Agenda.Job<Agenda.JobAttributesData>): Promise<void> {
    // do it what you want.
    // dont need to worry about call done() callback, the result of the job will be the same as the Promise in the response
  }

}
```

### 步骤2：配置

您可以使用mongodb连接或者传入一个`Agenda`实例来配置`inversify-agenda`。

使用`mongodb`的情况：

```ts
// or whatever way you have to get your inversify container.
import { container } from './inversify.config';

const agenda = new InversifyAgenda(container, {
    db: {
    address: process.env.MONGO_URL,
    options: {
            useNewUrlParser: true
            // other options
        }
    }
}).build();
agenda.start();
```

传入以创建的`Agenda`实例的情况:

```ts
// or whatever way you have to get your inversify container.
import { container } from './inversify.config';
const agenda = new Agenda({
    db: {
        address: this.config.db.address,
        collection: this.config.db.collection,
        options: this.config.db.options
    }
});
const agenda = new InversifyAgenda(container, { agenda }).build();
agenda.start();
```

## 示例

[这里有一些示例](https://github.com/lautarobock/inversify-agenda/blob/master/examples/simple/README.md)


