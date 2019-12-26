---
title: 活性句柄
---

# 活性句柄

将活性句柄作为类型添加是可行的。活性句柄的调用时机是在依赖解析之后，添加到缓存(如果是单例模式)和注入之前。这对于实现未知依赖监控(如缓存和日志)大有其用。下面的示例展示了如何使用[Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)拦截依赖项(`Katana`)的其中一个方法(的使用)：

```ts
interface Katana {
    use: () => void;
}

@injectable()
class Katana implements Katana {
    public use() {
        console.log("Used Katana!");
    }
}

interface Ninja {
    katana: Katana;
}

@injectable()
class Ninja implements Ninja {
    public katana: Katana;
    public constructor(@inject("Katana") katana: Katana) {
        this.katana = katana;
    }
}
```

```ts
container.bind<Ninja>("Ninja").to(Ninja);

container.bind<Katana>("Katana").to(Katana).onActivation((context, katana) => {
    let handler = {
        apply: function(target, thisArgument, argumentsList) {
            console.log(`Starting: ${new Date().getTime()}`);
            let result = target.apply(thisArgument, argumentsList);
            console.log(`Finished: ${new Date().getTime()}`);
            return result;
        }
    };
    katana.use = new Proxy(katana.use, handler);
    return katana;
});
```

```ts
let ninja = container.get<Ninja>();
ninja.katana.use();
> Starting: 1457895135761
> Used Katana!
> Finished: 1457895135762
```