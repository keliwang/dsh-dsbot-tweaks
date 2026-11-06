# DS Bot Tweaks（DS Bot 小改动）

[English](README.md) | 中文

> 收纳给 [DS Bot](https://github.com/deepseek-ai/deepseek-harness) 加的各种小改动，一个包维护，不用为每个小功能单独发包。

每个改动都是客户端里的一小段 UI 增补，不修改 DS Bot 包本身，所以 DS Bot 升级不会覆盖它们。

## 包含的改动

| 改动 | 出现位置 | 作用 |
|---|---|---|
| **原生界面切换** | DS Bot 左下角、设置齿轮旁边 | 点圆形切换按钮，切到 DSH 原生界面（经典 Agent 模式） |

## 安装

需要目标 profile 里已安装 **DS Bot**（在 ds-bot 0.3.0 上验证）。

**Harness Desktop（macOS、Windows）**

1. 侧栏点 **插件** → **添加插件**。
2. **包名或地址** 填打包好的 tgz 绝对路径，例如 `/path/to/dsh-dsbot-tweaks-0.1.0.tgz`；开发时也可以填仓库目录（link 方式）。
3. 点 **安装**，刷新页面（⌘R / Ctrl+R）。如果提示需要重启 DSH，完全退出再打开。

**Harness Web / CLI**

```sh
cd dsh-dsbot-tweaks
npm run build
pnpm pack
dsh plugin --profile <profile> add ./dsh-dsbot-tweaks-0.1.0.tgz
```

这个包没有 Host 侧依赖。日常使用装 tgz（版本固定）；开发时也可以 `add /path/to/dsh-dsbot-tweaks` 用 link 安装，改完刷新即可。

## 使用

### 原生界面切换

DS Bot 左下角设置齿轮旁边会多一个圆形切换按钮（⇄，悬停显示说明）。

1. 刷新页面后，点 **齿轮旁边的切换按钮**。
2. 页面切到 DSH 原生界面（经典 Agent 模式）。要回来就用原生界面侧栏底部的 **DS Bot** 按钮。

按钮只在 DS Bot 界面出现；DSH 原生界面里刻意不加。

## 再加一个小改动

源码按「一个改动一个文件」组织，加改动三步：

1. 在 `src/client/tweaks/` 新建文件，导出工厂函数（返回 `{ id, enabled(), apply(), install? }`）。
2. 在 `src/client/index.js` 的 `TWEAKS` 里注册它。
3. `npm run build` 生成 `client.js`，再刷新页面。

共享一个 `MutationObserver`：页面 DOM 变化后按帧调用每个 `enabled()` 为真的 `apply()`，所以 `apply()` 必须幂等、便宜；需要自己的监听器或定时器时用 `install()`，它只调用一次。

完整模板和约定见 [docs/adding-a-tweak.md](docs/adding-a-tweak.md)。

## 原理与限制

- 这些改动依赖 DS Bot 渲染出的 DOM，例如原生界面切换用到 `.bt-leftcol-foot`、`button.bt-account`、`span.bt-you`。DS Bot 以后改左下角布局时，需要同步更新对应改动里的选择器。
- 原生界面切换优先调用 DS Bot 自己的切换动作（`actions.setSurface('agent')`，和设置里那行「切换」是同一个调用），所以是即时切换、不刷新。这个动作没有公开接口，是从齿轮按钮的 React fiber 上借到的——属于私有结构；DS Bot/React 改动后如果借不到，会自动退回「写 `localStorage['ds-bot:surface']` + 整页刷新」，功能不受影响，只是会慢几秒。
- 不联网、不写磁盘、不接触凭据。

## 开发

```
dsh-dsbot-tweaks/
├── package.json           # bundle + client manifest
├── cordis.patch.yml       # 把插件行插进 profile
├── index.js               # Host 侧（空实现）
├── client.js              # 构建产物，不要手改
├── src/client/
│   ├── index.js           # 入口：TWEAKS 注册表
│   ├── lib/               # 共享：dom、surface、借用 DS Bot actions
│   └── tweaks/            # 一个改动一个文件
├── scripts/build-client.mjs
├── docs/adding-a-tweak.md
├── locale/ icon.svg
└── README*.md
```

DSH 客户端每个包只加载一个 `client.js`，所以源码用 esbuild 打包成它：

```sh
pnpm install     # 首次，只装 devDependency（esbuild）
npm run build    # src/client → client.js
npm run check    # 校验 client.js 与 src/client 一致
```

改完源码要重新构建再刷新页面。如果 profile 装的是 tgz，还要重新 `pnpm pack` 并重装（先移除旧 bundle，再装新 tgz）；用 link 安装时构建完直接刷新即可。插件规范（bundle、patch、`dsh.client` manifest）见 DSH 源码的 `docs/user/develop/basic/publish.zh.md`。

调试时在 DS Bot 界面里确认：改动按预期出现、重复触发不会插入两份、切换界面后该消失的会消失。

## 卸载

在插件页移除，或：

```sh
dsh plugin --profile <profile> remove dsh-dsbot-tweaks
```

移除后刷新页面即可，不会留下其他状态。
