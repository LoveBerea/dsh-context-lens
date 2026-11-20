# dsh-context-lens

DeepSeek Harness 的上下文缓存分析插件。它回答一个具体问题：**在多轮代理会话中，之前的思考内容是否会被持续加入后续请求的上下文？**

插件同时提供两件事：

1. **按轮次整理的会话视图**：每一轮（step）的「思考过程」与「正式输出」是两项独立可折叠内容，工具调用单独折叠，历史思考不再和工具结果混在一起。
2. **上下文重合 / 差异比对**：把相邻两次模型请求的输入上下文做比较，显示连续重合长度、重合比例、新增项、移除项，以及被再次注入的旧思考块数量。

## 安装

```sh
dsh plugin --profile web add github:LoveBerea/dsh-context-lens
```

首次从 GitHub 安装时，pnpm 会要求允许构建脚本；按 CLI 提示把 `dsh-context-lens: true` 加入 profile 的 `pnpm-workspace.yaml` 的 `allowBuilds`，然后重新执行安装。发布到 npm 后可直接 `dsh plugin --profile web add dsh-context-lens`。

安装后在 Web 会话的聊天流中会出现标记为「上下文缓存分析」的节点；每个助手步骤一个节点，聊天视图本身按轮次分组。

## 比对口径

分析以 Session 事件为准重建每一步的模型可见上下文（`system/message`、`user/message`、`assistant/message`、`tool/result`、`developer/message`），并尊重 `surfaceOp: replace` 所代表的压缩替换：

- **连续重合（prefix）**：两次请求从头开始完全相同的上下文项数量。
- **上下文重合（overlap）**：前一次请求中仍存在于后一次请求的上下文项比例。
- **新增 / 移除**：按消息身份（消息 id，或内容摘要）做多重集差集。
- **思考重注入（reasoning replay）**：本次请求中的 `reasoning` 块，其文本与此前任一次请求中的 `reasoning` 块完全相同。比例为重注入块数 / 本次思考块总数。

Host 侧另外监听 `llm/stream`，记录适配器实际收到的 `options.messages`，可通过 `import { historyOf } from 'dsh-context-lens'` 读取某个 session 的最近 200 次请求比对结果。Web 侧显示的是从 Session 事件重建的结果；它覆盖当前已加载的事件窗口，且不描述 provider 序列化阶段是否真的把 reasoning 发到线上。

## 交互

- 每个分析卡片按「第 N 轮 · 第 M 步」标记，继承聊天视图的轮次分组。
- 「思考过程」「正式输出」「工具调用」「上下文差异」四项各自独立折叠，折叠态显示首行摘要或条目数。
- 重合比例用进度条呈现；思考重注入数量大于零时使用强调色。
- 差异列表按角色标记（user / assistant / tool / system），长文本滚动查看。

## 开发

```sh
npm test     # node:test 覆盖纯分析逻辑
npm run build  # 从 src/ 重新生成 client.js
```

`client.js` 与 `index.js` 都已提交，因此从 Git 安装无需构建步骤。`src/analysis.js` 是 Host 与 Web 共用的唯一分析实现；`build.mjs` 把它原样内联进浏览器模块加载器格式的 `client.js`。

## License

MIT
