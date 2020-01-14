# 基础

[原文链接](https://github.com/inversify/inversify-basic-example)

本文展示了一些设置InversifyJS的基本示例。

非常基础的示例。

声明了如下项目：

- 三个接口`Warrior`、`Weapon`和`Battle`。
- 两个`Weapon`接口的实现：`Katana`和`Shuriken`。
- 两个`Warrior`接口的实现：`Ninja`和`Samurai`。
- 一个`Battle`接口的实现：`EpicBattle`。

勇者拿到了一件趁手的武器，额...还标记了一些元数据(metadata)。

我们使用了一些限制条件`whenTargetNamed`和`whenParentNamed`来约束勇者`Warrior`能拿(注入和实现)哪些武器`Weapon`，以及什么级别的勇者`Warrior`才能参加`EpicBattle`：

```ts
container.bind<Warrior>(SERVICE_IDENTIFIER.WARRIOR).to(Ninja).whenTargetNamed(TAG.CHINESE);
container.bind<Warrior>(SERVICE_IDENTIFIER.WARRIOR).to(Samurai).whenTargetNamed(TAG.JAPANESE);
container.bind<Weapon>(SERVICE_IDENTIFIER.WEAPON).to(Shuriken).whenParentNamed(TAG.CHINESE);
container.bind<Weapon>(SERVICE_IDENTIFIER.WEAPON).to(Katana).whenParentNamed(TAG.JAPANESE);
container.bind<Battle>(SERVICE_IDENTIFIER.BATTLE).to(EpicBattle);
```

## 怎么运行示例呢?

您可以先拉取项目：

```bash
git clone https://github.com/inversify/inversify-basic-example.git
```

然后进入示例文件夹📂安装依赖：

```bash
cd inversify-basic-example
npm install
```

接着将TypeScript代码编译成JavaScript代码：

```bash
gulp
```

这些生成的代码可以在`dist`目录📂中查看。

接着运行代码就能看到示例了。

```bash
node dist/main.js
```

控制台应该会打印下面内容：

```bash
FIGHT!
                Ninja (Shuriken)
                vs
                Samurai (Katana)
```