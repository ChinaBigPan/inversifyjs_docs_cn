# inversifyjs-binding-decorators

## 简介

在本示例中，因为`inversifyjs-binding-decorators`的使用，所有的可注入实体都使用了`@provide(TYPE)`进行装饰，而非`@injectable()`。

在`utils/mongodb`文件夹中的是一个叫做`client.ts`的类。这个类是用于增、删、改、查操作的封装。它并未替代所有MongoDB操作。

有一个情况：在测试期间，MongoDB的客户端会被mock类取代。这样做的原因是，当我们测试(使用了Inversify控制器的)路由时，我们仅仅是想测试路由的可行性，而非测试MongoDB客户端是否成功地在数据库中写入了什么。若要测试客户端，我们还有另一个专门的测试。

## 使用的中间件

| 中间件 | 原因 |
|------|-----|
| [body-parser](https://github.com/expressjs/body-parser) | 我们需要查看请求体内容 |
| [helmet](https://github.com/helmetjs/helmet) | 为应用添加一些保护，并移除诸如`X-Powered-By`等请求头 | 