---
title: 属性注入
sidebarDepth: 2
---

# 属性注入

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/property_injection.md)

InversifyJS 支持属性注入，因为有时候构造器注入并不是最好的注入模式。当然了，在大多数情况下，您仍旧应该避免使用属性注入而采用构造器注入的方式。

> 如果是类在没有依赖项无法工作的情况下，应当将其添加到构造函数中。这个类需要一些新的依赖，因此你希望你的更改会破坏一些东西。另外，创建一个未完全初始化（“两步构建”）的类其实是一种反模式（IMHO，in my humble opinion，依我拙见）.如果类可以在没有依赖项的情况下工作，设置setter即可。

[来源 stackoverflow](https://stackoverflow.com/questions/1503584/dependency-injection-through-constructors-or-property-setters)

下面两种情况您可能会考虑使用属性注入：

- 当我们**能够**使用InversifyJS来创建类的实例的时候。
- 当我们**无法**使用InversifyJS来创建类的实例的时候。

我靠，你在逗我？其实，在不同的场景情况需要不同的属性注入实现方式。

## 当我们**能够**使用InversifyJS来创建类的实例的时候

如果您正在使用的库或框架允许InversifyJS在应用中创建类的实例，那么您可以使用`@inject`装饰器注入属性：

```ts
import { injectable, inject, container } from "inversify";

@injectable()
class PrintService {
    // ...
}

@injectable()
class Summary {
    // ...
}

@injectable()
class Author {
    // ...
}

@injectable()
class Book {

  private _author: Author;
  private _summary: Summary;

  @inject("PrintService")
  private _printService: PrintService;

  public constructor(
      @inject("Author") author: Author,
      @inject("Summary") summary: Summary
) {
    this._author = author;
    this._summary = summary;
  }

  public print() {
     this._printService.print(this);
  }

}

let container = new Container();
container.bind<PrintService>("PrintService").to(PrintService);
container.bind<Author>("Author").to(Author);
container.bind<Summary>("Summary").to(Summary);
container.bind<Book>("Book").to(Book);

// Book instance is created by InversifyJS
let book = container.get<Book>("Book");
book.print();
```

我们的[单元测试](https://github.com/inversify/InversifyJS/blob/master/test/annotation/inject.test.ts)这里有更多例子嗷。


## 当我们**无法**使用InversifyJS来创建类的实例的时候

InversifyJS的设计方式使其能够与尽可能多的库和框架进行集成。但是，它的许多功能需要在应用内部创建类的实例。

这就产生了一个问题，一些框架接管了创建实例的控制权。比方说，React会接管传入组件的实例创建权。

我们开发了一个工具来方便您在InversifyJS尚未创建实例的情况下注入属性：

```ts
import getDecorators from "inversify-inject-decorators";
import { Container, injectable  } from "inversify";

@injectable()
class PrintService {
    // ...
}

let container = new Container();
container.bind<PrintService>("PrintService").to(PrintService);
let { lazyInject } = getDecorators(container);

class Book {

  private _author: string;
  private _summary: string;

  @lazyInject("PrintService")
  private _printService: PrintService;

  public constructor(author: string, summary: string) {
    this._author = author;
    this._summary = summary;
  }

  public print() {
     this._printService.print(this);
  }

}

// Book 的实例并不是由 InversifyJS 创建的
let book = new Book("Title", "Summary");
book.print();
```

这个工具模块就是`inversify-inject-decorators`，它内置了下面的装饰器：

- `@lazyInject`用于在没有元数据的情况下注入属性。
- `@lazyInjectNamed`用于在没有具名元数据的情况下注入属性。
- `@lazyInjectTagged`用于在没有带标签元数据的情况下注入属性。
- `@lazyMultiInject`用于多重注入。

请访问[这里](https://github.com/inversify/inversify-inject-decorators)进一步了解。


