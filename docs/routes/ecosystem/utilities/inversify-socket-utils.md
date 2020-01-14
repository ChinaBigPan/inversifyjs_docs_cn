# inversify-socket-utils

[原文链接](https://github.com/alxshelepenok/inversify-socket-utils)

::: warning
本框架并非官方文档中的框架，为译者搜索并添加，请知悉。
:::

一些方便InversifyJS和socket.io开发的辅助工具。

## 安装

您可以使用npm来安装`inversify-socket-utils`:

```bash
npm install inversify inversify-socket-utils reflect-metadata --save
```

`inversify-socket-utils`类型定义包含在了npm模块中，TypeScript版本要求是2.0以上。请参阅[InversifyJS文档](https://github.com/inversify/InversifyJS#installation)以了解更多关于安装过程的信息。

## 如何使用

第一步：创建控制器

```ts
import { injectable } from "inversify";
import { Controller, Payload, ConnectedSocket, OnConnect, OnDisconnect, OnMessage } from "../../../src";
import "reflect-metadata";

@injectable()
@Controller(
  '/namespace'
)
export class MessageController {
  @OnConnect("connection")
    connection() {
      console.log("Client connected");
    }

    @OnDisconnect("disconnect")
    disconnect() {
      console.log("Client disconnected");
    }

    @OnMessage("message")
    message(@Payload() payload: any, @ConnectedSocket() socket: any) {
      console.log("Message received");
      socket.emit("message", "Hello!");
    }
}
```

第二步：配置容器和服务器

像往常一样在您的根文件中配置反转容器。

接下来，将容器传入`InversifySocketServer`构造器。这样就将容器中所有的控制器及其依赖项进行了注册，并将其附加到socket.io应用中。接下来调用`server.build()`启动服务。

为了确保`InversifySocketServer`能够找到你的控制器，请务必绑定`TYPE.Controller`并将控制器名称作为其标签。

```ts
import * as http from "http";
import * as SocketIO from "socket.io";
import { Container } from "inversify";
import { Interfaces, InversifySocketServer, TYPE } from "../../src";
import { MessageController } from "./controllers/message";

let container = new Container();

container.bind<Interfaces.Controller>(TYPE.Controller).to(MessageController);

let app = http.createServer();

let io = SocketIO(app);
let server = new InversifySocketServer(container, io);
server.build();

app.listen(3000);
console.log(`Server is listening on port 3000`);
```



