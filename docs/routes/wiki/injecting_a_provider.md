---
title: 注入Provider（异步工厂）
sidebarDepth: 2
---

# 注入Provider（异步工厂）

[原文链接](https://github.com/inversify/InversifyJS/blob/master/wiki/provider_injection.md)

将抽象类绑定到Provider。Provider是一个异步工厂，这在处理异步I/O操作时非常有用。

```ts
type KatanaProvider = () => Promise<Katana>;

@injectable()
class Ninja implements Ninja {

    public katana: Katana;
    public shuriken: Shuriken;
    public katanaProvider: KatanaProvider;

    public constructor(
	    @inject("KatanaProvider") katanaProvider: KatanaProvider, 
	    @inject("Shuriken") shuriken: Shuriken
    ) {
        this.katanaProvider = katanaProvider;
        this.katana= null;
        this.shuriken = shuriken;
    }

    public fight() { return this.katana.hit(); };
    public sneak() { return this.shuriken.throw(); };

}
```

```ts
container.bind<KatanaProvider>("KatanaProvider").toProvider<Katana>((context) => {
    return () => {
        return new Promise<Katana>((resolve) => {
            let katana = context.container.get<Katana>("Katana");
            resolve(katana);
        });
    };
});

var ninja = container.get<Ninja>("Ninja");

ninja.katanaProvider()
     .then((katana) => { ninja.katana = katana; })
     .catch((e) => { console.log(e); });
```

## 提供自定义参数

绑定`toProvider`需要`ProviderCreator`作为其*唯一*参数:

```ts
interface ProviderCreator<T> extends Function {
    (context: Context): Provider<T>;
}
```

`provider`的格式如下：

```ts
interface Provider<T> extends Function {
    (...args: any[]): (((...args: any[]) => Promise<T>) | Promise<T>);
}
```

遵循上面的格式，我们就能够向`provider`传递自定义参数了：

```ts
let container = new Container();

interface Sword {
    material: string;
    damage: number;
}

@injectable()
class Katana implements Sword {
    public material: string;
    public damage: number;
}

type SwordProvider = (material: string, damage: number) => Promise<Sword>;

container.bind<Sword>("Sword").to(Katana);

container.bind<SwordProvider>("SwordProvider").toProvider<Sword>((context) => {
    return (material: string, damage: number) => { // 自定义参数
        return new Promise<Sword>((resolve) => {
            setTimeout(() => {
                let katana = context.container.get<Sword>("Sword");
                katana.material = material;
                katana.damage = damage;
                resolve(katana);
            }, 10);
        });
    };
});

let katanaProvider = container.get<SwordProvider>("SwordProvider");

katanaProvider("gold", 100).then((powerfulGoldKatana) => { // 使用所有自定义参数
    expect(powerfulGoldKatana.material).to.eql("gold");
    expect(powerfulGoldKatana.damage).to.eql(100);
});

katanaProvider("gold", 10).then((notSoPowerfulGoldKatana) => {
    expect(notSoPowerfulGoldKatana.material).to.eql("gold");
    expect(notSoPowerfulGoldKatana.damage).to.eql(10);
});
```

## Provider 部分应用

我们还可以使用部分应用来传递参数

```ts
let container = new Container();

interface Sword {
    material: string;
    damage: number;
}

@injectable()
class Katana implements Sword {
    public material: string;
    public damage: number;
}

type SwordProvider = (material: string) => (damage: number) => Promise<Sword>;

container.bind<Sword>("Sword").to(Katana);

container.bind<SwordProvider>("SwordProvider").toProvider<Sword>((context) => {
    return (material: string) => {  // 自定义参数 1!
        return (damage: number) => { // 自定义参数 2!
            return new Promise<Sword>((resolve) => {
                setTimeout(() => {
                    let katana = context.container.get<Sword>("Sword");
                    katana.material = material;
                    katana.damage = damage;
                    resolve(katana);
                }, 10);
            });
        };
    };
});

let katanaProvider = container.get<SwordProvider>("SwordProvider");
let goldKatanaProvider = katanaProvider("gold");  // 应用第一个自定义参数!

goldKatanaProvider(100).then((powerfulGoldKatana) => { // 应用第二个自定义参数!
    expect(powerfulGoldKatana.material).to.eql("gold");
    expect(powerfulGoldKatana.damage).to.eql(100);
});

goldKatanaProvider(10).then((notSoPowerfulGoldKatana) => {
    expect(notSoPowerfulGoldKatana.material).to.eql("gold");
    expect(notSoPowerfulGoldKatana.damage).to.eql(10);
});
```

## 单例 provider

虽然`Provider`总是以单例形式被注入，但是您可以控制它的返回值是使用单例还是瞬态作用域(transient scope):

```ts
let container = new Container();

interface Warrior {
    level: number;
}

@injectable()
class Ninja implements Warrior {
    public level: number;
    public constructor() {
        this.level = 0;
    }
}

type WarriorProvider = (level: number) => Promise<Warrior>;

container.bind<Warrior>("Warrior").to(Ninja).inSingletonScope(); // Value is singleton!

container.bind<WarriorProvider>("WarriorProvider").toProvider<Warrior>((context) => {
    return (increaseLevel: number) => {
        return new Promise<Warrior>((resolve) => {
            setTimeout(() => {
                let warrior = context.container.get<Warrior>("Warrior"); // Get singleton!
                warrior.level += increaseLevel;
                resolve(warrior);
            }, 100);
        });
    };
});

let warriorProvider = container.get<WarriorProvider>("WarriorProvider");

warriorProvider(10).then((warrior) => {
    expect(warrior.level).to.eql(10);
});

warriorProvider(10).then((warrior2) => {
    expect(warrior.level).to.eql(20);
});
```

## Provider 默认值

下面的函数可以帮助您在注入`provider`时提供一个默认值：

```ts
function valueOrDefault<T>(provider: () => Promise<T>, defaultValue: T) {
    return new Promise<T>((resolve, reject) => {
        provider().then((value) => {
            resolve(value);
        }).catch(() => {
            resolve(defaultValue);
        });
    });
}
```

下面来展示一下`valueOrDefault`函数的使用方式：

```ts
@injectable()
class Ninja {
    public level: number;
    public rank: string;
    public constructor() {
        this.level = 0;
        this.rank = "Ninja";
    }
    public train(): Promise<number> {
        return new Promise<number>((resolve) => {
            setTimeout(() => {
                this.level += 10;
                resolve(this.level);
            }, 100);
        });
    }
}

@injectable()
class NinjaMaster {
    public rank: string;
    public constructor() {
        this.rank = "NinjaMaster";
    }
}

type NinjaMasterProvider = () => Promise<NinjaMaster>;

let container = new Container();

container.bind<Ninja>("Ninja").to(Ninja).inSingletonScope();
container.bind<NinjaMasterProvider>("NinjaMasterProvider").toProvider((context) => {
    return () => {
        return new Promise<NinjaMaster>((resolve, reject) => {
            let ninja = context.container.get<Ninja>("Ninja");
            ninja.train().then((level) => {
                if (level >= 20) {
                    resolve(new NinjaMaster());
                } else {
                    reject("Not enough training");
                }
            });
        });
    };
});

let ninjaMasterProvider = container.get<NinjaMasterProvider>("NinjaMasterProvider");

valueOrDefault(ninjaMasterProvider, { rank: "DefaultNinjaMaster" }).then((ninjaMaster) => {
    // 这里使用了默认值因为 provider 被 rejected 了 （忍者等级还不到20级）
    expect(ninjaMaster.rank).to.eql("DefaultNinjaMaster");
});

valueOrDefault(ninjaMasterProvider, { rank: "DefaultNinjaMaster" }).then((ninjaMaster) => {
    // 传入的 NinjaMaster 起作用了，因为忍者已经大于20级了
    expect(ninjaMaster.rank).to.eql("NinjaMaster");
    done();
});
```