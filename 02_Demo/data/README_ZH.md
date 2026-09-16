# Demo 数据说明

本目录只存放**合成演示数据**，用于无 API / Mock 模式的稳定演示与测试。

- `demo_scenario.json`：完整输入场景与可复算的示例收入拆分。
- `portfolio_sample.json`：合成持仓上下文。
- `mock_stage_outputs.json`：Mock 后端 9 个阶段及报告后追问的固定返回。

真实 LLM 模式不会把这些合成值当作上市公司事实；检索阶段通过 Responses API 的 Web Search 获取公开信息，未检索到的数据必须保持“未知/待补”。
