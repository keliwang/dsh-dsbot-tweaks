# 添加一个小改动

这个包把所有改动放在一个 DSH bundle 里，源码按「一个改动一个文件」组织。

## 目录约定

```
src/client/
├── index.js              # 入口：TWEAKS 注册表 + 挂载 DOM 观察器
├── lib/                  # 共享工具（改动之间复用，不放具体功能）
│   ├── dom.js            # 语言判断、watchDom()
│   ├── dsbot.js          # 借用 DS Bot 的 React actions
│   └── surface.js        # surface 状态与刷新兜底
└── tweaks/
    └── native-switch.js  # 一个改动一个文件
```

## 三步加一个改动

1. 在 `src/client/tweaks/` 新建文件，导出一个工厂函数：

```js
import { onBotSurface } from '../lib/surface.js';

export function myTweak() {
  return {
    id: 'my-tweak',

    // 返回 false 时本次跳过（比如只在 DS Bot 界面生效）
    enabled: onBotSurface,

    // 页面 DOM 变化后按帧调用；必须幂等、便宜
    apply() {
      // 找到目标节点，缺什么就补什么，重复调用不产生第二份
    },

    // 可选：需要自己的事件监听、定时器或快捷键时用，只调用一次
    // install() {},
  };
}
```

2. 在 `src/client/index.js` 里注册：

```js
import { myTweak } from './tweaks/my-tweak.js';

const TWEAKS = [
  nativeSwitch(),
  myTweak(),
];
```

3. 构建并刷新页面：

```sh
pnpm install   # 首次
npm run build  # 生成 client.js
npm run check  # 确认 client.js 与 src/client 一致
```

## 约束

- **`client.js` 是构建产物，不要手改**。DSH 客户端每个包只加载一个 `client.js`，所以源码必须打包；`npm run check` 会检查产物是否过期。
- `apply()` 会被反复调用：先查再插，或用 `[data-dsbot-tweak="<id>"]` 做幂等标记。
- 依赖 DS Bot 的 DOM 时，用最小的选择器，并在 README 的「包含的改动」表格里补一行。
- 不要注册全局 UI 槽位（如 `shell.overlay`）；改动只放进 DS Bot 自己的界面。
- 不联网、不写磁盘、不接触凭据。
- 需要调用 DS Bot 内部能力时，先看 `lib/dsbot.js` 的借用方式；借不到一定要有兜底路径。
