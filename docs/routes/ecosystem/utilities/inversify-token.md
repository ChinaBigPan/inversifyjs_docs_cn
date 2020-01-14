# inversify-token

[原文链接](https://github.com/mscharley/inversify-token)

## 简介

基于token的InversifyJS层，为TypeScript注入提供了更强大的类型安全保证。

## 安装

```bash
npm i inversify-token
```

## 使用

```ts
// 声明你的接口.

// 文件📃 types.ts
import { Token, TokenType } from "inversify-token";
import { Warrior, Weapon, ThrowableWeapon } from "./interfaces"

const WarriorToken = new Token<Warrior>(Symbol.for("Warrior"));
type WarriorToken = TokenType<typeof WarriorToken>;
const WeaponToken = new Token<Weapon>(Symbol.for("Weapon"));
type WeaponToken = TokenType<typeof WeaponToken>;
const ThrowableWeaponToken = new Token<ThrowableWeapon>(Symbol.for("ThrowableWeapon"));
type ThrowableWeaponToken = TokenType<typeof ThrowableWeaponToken>;

export {
    WarriorToken as Warrior,
    WeaponToken as Weapon,
    ThrowableWeaponToken as ThrowableWeapon,
}
```

```ts
// 文件📃 entities.ts
import { injectable } from "inversify";
import { injectToken } from "inversify-token";
import * as TYPES from "./types";

@injectable()
class Ninja implements Warrior {

    public constructor(
        @injectToken(TYPES.Weapon) private _katana: TYPES.Weapon,
        @injectToken(TYPES.ThrowableWeapon) private _shuriken: TYPES.ThrowableWeapon,
    ) { }

    public fight() { return this._katana.hit(); }
    public sneak() { return this._shuriken.throw(); }

}
```

```ts
// 文件📃 inversify.config.ts
import { getToken, tokenBinder } from "inversify-token";

const myContainer = new Container();
const bindToken = tokenBinder(myContainer.bind.bind(myContainer));
bindToken(TYPES.Warrior).to(Ninja);
bindToken(TYPES.Weapon).to(Katana);
bindToken(TYPES.ThrowableWeapon).to(Shuriken);
const warrior = getToken(container, TYPES.Warrior);
```

```ts
// 文件📃 inversify.module.ts
import { getToken, TokenContainerModule } from "inversify-token";

const myContainer = new Container();
const module = new TokenContainerModule((bindToken) => {
    bindToken(TYPES.Warrior).to(Ninja);
    bindToken(TYPES.Weapon).to(Katana);
    bindToken(TYPES.ThrowableWeapon).to(Shuriken);
});
myContainer.load(module);
const warrior = getToken(container, TYPES.Warrior);
```