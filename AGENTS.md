# AGENTS.md

面向在本仓库（`dsh-dsbot-tweaks`）工作的 Agent 的项目约定。

## 版本号：只在用户明确要求时升级

- 不要为了让一次改动“看起来完整”而修改 `package.json` 的 `version`。功能、修复、文档改动一律不升版本。
- 只有用户明确要求“发版 / 升级版本”时才改 `version`。

## 这个包是什么

一个纯客户端的 DSH 插件，收纳给 DS Bot 加的小改动。当前只有一项：在 DS Bot 左下角设置齿轮旁边加一个圆形切换按钮（`.bt-leftcol-foot` 内、`button.bt-account` 之后，复用 `span.bt-you` 样式）；点击优先调用借用来的 `actions.setSurface('agent')` 即时切换，失败时写 `localStorage['ds-bot:surface'] = 'agent'` 再刷新。

- 不修改 `ds-bot` 包本身，也不依赖它的内部模块；只依赖它渲染出的 DOM。
- 目录：`src/client/tweaks/` 一个改动一个文件，`src/client/lib/` 放共享工具，`src/client/index.js` 是 `TWEAKS` 注册表。
- 每个改动返回 `{ id, enabled(), apply(), install? }`；共享一个 `MutationObserver`，按帧调用每个 `enabled()` 为真的 `apply()`，`apply()` 必须幂等、便宜。
- 原生界面切换的点击优先走「借用」的 DS Bot 动作：从齿轮按钮的 React fiber 上找到 `actions.setSurface` 并调用。拿不到时退回写 `localStorage['ds-bot:surface']` 再刷新，不能因为 fiber 结构变化就让功能失效。
- 只在 DS Bot 界面生效的改动用 `enabled()` 判断（`localStorage['ds-bot:surface'] !== 'agent'`）。

## 构建

- `client.js` 是构建产物，不要手改。DSH 客户端每个包只加载一个 `client.js`，所以源码必须打包。
- 改源码后运行 `npm run build`（`scripts/build-client.mjs`，esbuild），再刷新页面验证。
- 提交前跑 `npm run check`：语法检查 + 校验 `client.js` 与 `src/client` 一致。
- `pnpm-workspace.yaml` 里显式禁用了 esbuild 的安装脚本（`allowBuilds: esbuild: false`）：它用平台预编译包即可工作，不需要执行安装脚本。

## 改动时的边界

- 保持「不接触凭据、不联网、不写磁盘」。
- 不要注册 `shell.overlay` 之类的全局 UI；改动只放在 DS Bot 自己的界面里。
- DS Bot 升级后如果左下角布局变了（类名、结构），同步更新对应改动里的选择器和 README 的说明。
- 新增改动时，在 README 的「包含的改动」表格和使用说明里补一行。
