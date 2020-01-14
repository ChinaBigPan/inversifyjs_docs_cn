# Express

[原文链接](https://github.com/inversify/inversify-express-example)

> 官方的 express + inversify + inversify-express-utils 示例

## 查看示例

拉取项目后首先运行`npm install`

您可以使用`ts-node`来开启示例：

```bash
npm install -g ts-node
ts-node <example>/bootstrap
```

这样就可以启动服务器看到示例了。

如果您想要运行单元测试，运行`npm test <example>/**/*.spec.ts`即可。

运行所有测试请运行`npm run test:all`

## 示例说明

| 名称 | 描述 |
|-----|-----|
| Basic | 没有花活的基础示例 |
| MongoDB | 和基础示例类似。添加了一些MongoDB和中间件。文件夹内的readme有详细说明 |
| BindingDecorators | 和基础示例类似。添加了`inversify-binding-decorators` |
| MiddlewareInjection | 展示如何向控制器中注入中间件 |
| PostgresAndTypeORM | 如何将`inversify-express-utils`和TypeORM一同使用 |




