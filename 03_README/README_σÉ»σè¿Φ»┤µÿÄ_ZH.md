# EventLens v3.0 双语版｜启动说明

## 1. 这是什么

EventLens 是一个面向专业投研场景的上市公司重大事件影响分析 Agent Demo。v3.0 将原中文与英文版本合并为**同一个双语产品**。页面右上角提供 `中文 / English` 切换器。

语言选择会控制：

- Demo UI；
- 左侧 9 个 Agent 阶段；
- 离线 Demo 的内置报告与 Research Loop；
- 真实 LLM 模式的 System Prompt、阶段 Prompt、最终报告和后续追问。

用户自行输入的事件和组合上下文在切换语言时**保留原文**，不会被静默自动翻译。

---

## 2. 评审人 5 分钟路径

### 路径 A：不配置 API，先看完整交互（推荐）

1. 解压 ZIP，保持目录结构不变。
2. 打开 `02_Demo/`。
3. 双击 `打开Demo.html` 或 `Open_Demo.html`。
4. 在右上角选择 `中文` 或 `English`。
5. 不修改默认 CATL/宁德时代案例，点击绿色 **开始研判（Demo） / Start Analysis (Demo)**。
6. 确认左侧从 `0/9` 运行到 `9/9`，随后自动出现完整结构化报告。
7. 在报告底部测试：
   - 继续深究 / Deepen Analysis；
   - 新搜索 · Web / New Search · Web（离线模式会明确说明是模拟搜索，不联网）；
   - 开启新事件 / Start New Event。

离线 Demo 不需要 Node.js，不需要 API Key，不联网，不产生 API 费用。

> 离线版只对内置 CATL/宁德时代案例提供完整合成底稿。如果输入其它公司/事件，系统会明确显示“离线示例回放”，不会把 CATL 报告冒充成新事件分析。

### 路径 B：本地 Mock 后端

需要 Node.js 18+。在 `02_Demo/` 中：

- Windows：双击 `start-windows.bat`
- macOS：双击 `start-mac.command`

如果没有 `.env`，启动脚本会自动使用 Mock 模式。浏览器打开后仍可在右上角切换中文/English。

### 路径 C：真实 LLM + Web Search

1. 确认 Node.js 18+：

```bash
node --version
```

2. 在 `02_Demo/` 复制：

```text
.env.example -> .env
```

3. 只在你自己的 `.env` 中填写新 API Key：

```text
OPENAI_API_KEY=replace_with_your_new_key
OPENAI_MODEL=gpt-5.6-sol
OPENAI_FAST_MODEL=gpt-5.6-luna
ENABLE_WEB_SEARCH=true
MOCK_MODE=false
PORT=8787
```

4. 演示前运行：

```bash
npm run check:live
```

5. 预检 PASS 后启动：

```bash
npm start
```

或运行对应的 Windows/macOS 启动脚本。

6. 浏览器访问：

```text
http://localhost:8787
```

真实模式下，前端会在 `/api/analyze` 和 `/api/followup` 中发送 `language=zh` 或 `language=en`。后端使用对应语言的 Agent Prompt，因此不是只翻译 UI。

---

## 3. 语言切换规则

### 分析前切换

这是推荐方式。未修改的内置事件和组合示例会自动切成目标语言。

### 已输入自定义事件后切换

系统保留用户原始输入。例如研究员用中文写了一条事件后切换到 English UI，事件原文仍然保持中文；真实 LLM 会按 English 输出分析，但不会篡改输入。

### 报告生成后的语言

每一轮真实 LLM 研判使用**开始该轮分析时的当前语言**。如需另一语言版本，切换语言后重新运行该事件即可。这样避免后台在没有明确请求的情况下额外调用模型翻译已生成报告并产生费用。

---

## 4. 三种运行模式区别

| 模式 | Node.js | API Key | 联网 | 真实模型 | 适合 |
|---|---|---|---|---|---|
| 离线 Demo | 不需要 | 不需要 | 否 | 否 | 最快评审 UI/流程 |
| Mock 后端 | 需要 | 不需要 | 否 | 否 | 验证前后端与流式 9 阶段 |
| Live LLM | 需要 | 需要 | 是 | 是 | 验证真实 Agent + Web Search |

---

## 5. 真实模式安全要求

- 不要把 API Key 写进 HTML、JS、README、截图、邮件或聊天。
- 不要把真实 `.env` 放回分享 ZIP。
- `.gitignore` 已忽略 `.env`。
- 如果某个 Key 曾经被公开或发进聊天，应撤销并新建。
- `npm run check:live` 不打印 Key，但会产生少量真实 API / Web Search 用量。

---

## 6. 真实 Agent 流程

每轮研判按以下 9 阶段执行：

1. 确认事件与主体
2. 重要性分诊
3. 多源证据召回
4. 完整性与口径对账
5. 基本面与财务传导
6. 预期差与估值重估
7. 组合影响映射
8. Challenger 与引用核验
9. 综合研判报告

其中多源召回、完整性对账、Challenger 在开启 Web Search 时可调用公开网页检索。缺证据必须保留为未知/待补。

---

## 7. 自动测试

在 `02_Demo/`：

```bash
npm test
```

覆盖：

- 双语文件完整性；
- 中文/英文 9 阶段 Mock 分析；
- 中文/英文 follow-up；
- 真实 Responses API 代码路径（本地 Stub，不产生外部 API 费用）；
- `web_search` + `tool_choice=required`；
- `url_citation` 解析；
- 通用敏感信息扫描。

如环境安装 Playwright，可额外运行：

```bash
npm run test:ui
```

---

## 8. 常见问题

**绿色按钮不能点？**

直接双击 `Open_Demo.html` 时按钮应自动进入离线 Demo 模式并可点击。如使用后端模式，请确认页面由 `http://localhost:<PORT>` 打开。

**切到 English 后为什么我自己输入的中文事件没有被翻译？**

这是刻意设计。研究输入是证据的一部分，切换 UI 语言不应静默改写原始输入。真实 LLM 会根据选择语言输出结果。

**为什么换一个公司后离线 Demo 仍出现 CATL 示例？**

离线 Demo 只有一个完整合成场景。非内置输入会明确标记为“示例回放”，真正任意事件分析需要 Live LLM 模式。

**如何确认真实 API 能跑？**

先执行 `npm run check:live`。通过后再做正式演示。

---

## 9. 目录

```text
EventLens_Final_Delivery_v3.0_Bilingual/
├─ 01_Design_Docs/
│  ├─ ZH/
│  └─ EN/
├─ 02_Demo/
│  ├─ 打开Demo.html
│  ├─ Open_Demo.html
│  ├─ Open_Demo_EN.html
│  ├─ public/index.html
│  ├─ public/index-en.html
│  ├─ server.js
│  ├─ .env.example
│  ├─ data/
│  ├─ scripts/
│  ├─ tests/
│  └─ qa/
├─ 03_README/
└─ 04_QA/
```
