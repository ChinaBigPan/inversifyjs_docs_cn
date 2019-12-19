---
title: 对Symbol的支持
---

# 对Symbol的支持

在大型应用中，使用字符串作为 InversifyJS 注入类型的标识符可能会导致命名冲突。我们支持并真心建议您使用[Symbol](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)而不是字符串。 

> Symbol是唯一且不可变的数据类型，可以用作对象的属性标识符。Symbol对象是原始数据类型symbol的隐式对象包装器。


```ts
import { Container, injectable, inject } from "inversify";

let Symbols = {
	Ninja : Symbol.for("Ninja"),
	Katana : Symbol.for("Katana"),
	Shuriken : Symbol.for("Shuriken")
};

@injectable()
class Katana implements Katana {
    public hit() {
        return "cut!";
    }
}

@injectable()
class Shuriken implements Shuriken {
    public throw() {
        return "hit!";
    }
}

@injectable()
class Ninja implements Ninja {

    private _katana: Katana;
    private _shuriken: Shuriken;

    public constructor(
	    @inject(Symbols.Katana) katana: Katana,
	    @inject(Symbols.Shuriken) shuriken: Shuriken
    ) {
        this._katana = katana;
        this._shuriken = shuriken;
    }

    public fight() { return this._katana.hit(); };
    public sneak() { return this._shuriken.throw(); };

}

var container = new Container();
container.bind<Ninja>(Symbols.Ninja).to(Ninja);
container.bind<Katana>(Symbols.Katana).to(Katana);
container.bind<Shuriken>(Symbols.Shuriken).to(Shuriken);
```