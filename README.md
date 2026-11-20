# dsh-context-lens

DeepSeek Harness 的上下文缓存分析插件。它回答一个具体问题：**在多轮代理会话中，之前的思考内容是否会被持续加入后续请求的上下文？**

插件提供一个独立界面（侧栏进入，不占用会话聊天流）：

1. **按轮次整理的会话视图**：每一轮（step）的「思考过程」与「正式输出」是两项独立可折叠内容，工具调用单独折叠，历史思考不再和工具结果混在一起。
2. **上下文重合 / 差异比对**：本轮输入上下文与「上一轮 / 前 3 轮 / 全部历史」比较，显示重合率、新增项、移除项，以及被再次注入的旧思考块数量。

## 安装

```sh
dsh plugin --profile web add github:LoveBerea/dsh-context-lens
```

首次从 GitHub 安装时，pnpm 会要求允许构建脚本；按 CLI 提示把 `dsh-context-lens: true` 加入 profile 的 `pnpm-workspace.yaml` 的 `allowBuilds`，然后重新执行安装。发布到 npm 后可直接 `dsh plugin --profile web add dsh-context-lens`。

安装后侧栏出现「缓存分析」入口，点击后主区域切换到独立页面；页面顶部可选择会话与对比范围。

## 比对口径

分析在每次助手消息落定之前采样当时的模型可见上下文（`system/message`、`user/message`、`assistant/message`、`tool/result`、`developer/message`），并尊重 `surfaceOp: replace` 所代表的压缩替换：

- **重合率（overlap）**：本次上下文中「此前已经出现过」的条目数 / 本次上下文条目数。因此本轮只要新增了上下文或思考被重新注入，重合率就低于 100%。
- **对比范围**：可切换「上一轮」「前 3 轮」「全部历史」。前几轮模式把多个历史上下文与历史输出合并成参照集合。
- **新增 / 移除**：按消息身份（消息 id，或内容摘要）做多重集差集。
- **思考重注入（reasoning replay）**：本次上下文中的 `reasoning` 块，其文本与选定范围内任一轮次产出的思考完全相同。页面同时显示重注入条数与占本次思考块的比例。

Host 侧另外监听 `llm/stream`，记录适配器实际收到的 `options.messages`，可通过 `import { historyOf } from 'dsh-context-lens'` 读取某个 session 的最近 200 次请求比对结果。Web 侧显示的是从 Session 事件重建的结果；它覆盖当前已加载的事件窗口，且不描述 provider 序列化阶段是否真的把 reasoning 发到线上。

## 交互

- 顶部选择会话（默认跟随主视图当前会话）与对比范围；汇总卡片显示轮次数、平均重合率、累计新增和最多重注入数。
- 主区域按「第 N 轮」分组；每步卡片显示第 M 步、重合率、新增条数、重注入条数，并以进度条呈现重合率。
- 「上下文差异」把与上一轮完全一致的缓存前缀收进可展开分组；每轮第一步默认展开该分组，展示差异处的全部上下文（含折叠部分），后续步骤默认折叠。组内每一项都能单独展开查看完整内容。
- 只在前缀之后的区域着色：新增内容标蓝，删除内容用主题感知的绿色强调，文字始终使用主题主文本色以保证对比度。界面明确说明这是上下文区域的不同，不是内容改动 diff。
- 差异条目按身份（消息 id 或内容摘要）保存折叠状态，同一条目在不同轮次之间保持一致；「思考过程」「正式输出」「工具调用」也按内容标识保存折叠状态。
- 重注入时显示明确提示；条目按角色标记（user / assistant / tool / system），长文本滚动查看。

## 开发

```sh
npm test       # node:test 覆盖比对逻辑与客户端注册/渲染
npm run build  # 从 src/ 重新生成 client.js
```

`client.js` 与 `index.js` 都已提交，因此从 Git 安装无需构建步骤。`src/analysis.js` 是 Host 与 Web 共用的唯一分析实现；`build.mjs` 把它原样内联进浏览器模块加载器格式的 `client.js`。

## License

MIT
