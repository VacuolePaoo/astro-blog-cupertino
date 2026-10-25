---
title: 将Responses格式模型接入Trae
description: Trae对Responses API格式的支持很不积极，本文用CCSwitch本地路由解决这个问题
pubDate: 2026-07-25
collection: 技术
slug: dd1bd85
tags:
  - Trae
  - AI
cover: https://dinoimg.236668.xyz/file/P4mHAQ3N.png
---

Responses API是OpenAI最新版本也是最推荐的API格式，其对工具调用和多模态的支持非常良好，而传统的Chat Completions格式只能用于对话（内建工具调用在客户端处理）

现在OpenAI官方API和大量中转站都使用Responses API作为请求格式，但国产Agent IDE——Trae却迟迟不支持，不知是何意味，是让用户自己适应吗？

本文使用CCSwitch将Responses API转为Anthropic Messages供Trae使用: )

## 准备阶段

1. Trae [国内版](https://www.trae.cn) [国际版](https://www.trae.ai/)
2. CCSwitch: [官网](https://www.ccswitch.io)
3. 要接入的中转站或API

[![Hellocoder中转站](https://dinoimg.236668.xyz/file/RDQ4i5Bv.png)](https://hicoder.de)

[Hellocoder中转站](https://hicoder.de)

AI印斯坦力推 | GPT系列低至0.06x Claude系列低至0.6x

## 配置CCS

新建Claude Code配置，因为只有它能将常见格式通过路由转换为A\ Messages格式，设置好请求地址和Key

![在 CCSwitch 中新建 Claude Code 配置](https://dinoimg.236668.xyz/file/8v3TIvxq.png)

展开高级选项，将API格式改为你要接入的供应商的格式

![在高级选项中选择供应商的 API 格式](https://dinoimg.236668.xyz/file/WPS496pI.png)

添加供应商，然后在主页中启用这个配置

进入设置页面-路由，打开路由总开关，启用Claude路由，并复制服务地址

![启用 CCSwitch 的 Claude 路由并复制服务地址](https://dinoimg.236668.xyz/file/PQaeBb36.png)

## 在Trae中添加模型

在服务商复制模型ID备用，不同服务商的ID可能不一样

![在服务商处复制模型 ID](https://dinoimg.236668.xyz/file/ZgLJfG8b.png)

打开Trae-设置-模型-添加模型-自定义配置

- API格式：Anthropic Messages
- 请求地址：`http://127.0.0.1:15721` （刚才在CCSwitch复制的服务地址，端口可能不同）
- 模型ID：从供应商复制的模型ID
- API密钥：`PROXY_MANAGED`

其余配置按需设置

---

尝试对话，Trae能正常请求并接收返回内容

![Trae 通过 CCSwitch 接收模型回复](https://dinoimg.236668.xyz/file/ilb9u8Jh.png)

测试是否能创建任务和子智能体

![Trae 创建任务与子智能体](https://dinoimg.236668.xyz/file/xTInmIts.png)

至此，Trae成功接入Responses格式的服务商

## Q&A

### 为什么API密钥是PROXY_MANAGED？

通过查看配置文件发现，Claude Code向CCS路由发送请求使用的Key是PROXY_MANAGED

![Claude Code 配置中的 PROXY_MANAGED 密钥](https://dinoimg.236668.xyz/file/NUKMFx6N.png)

### 为什么模型请求失败？

在服务商正常运行的情况下，可能是你的网络不稳定，或CCS本地路由不稳定导致

本文所用的方法是一种**用户适配厂商**的做法，归根结底还是字节跳动对ResponsesAPI格式支持不积极

### 转换格式有什么影响？

有用户反应通过这种方法接入的模型看不到思考内容，这是可能出现的情况之一

Anthropic Messages格式是为直接请求模型而生，而Responses API才是为任务和工具而生，下方是ChatGPT给出的对比

|          | Anthropic Messages | OpenAI Responses                   |
| -------- | ------------------ | ---------------------------------- |
| 核心理念     | 给模型发送消息            | 让模型参与一个响应/任务流程                     |
| 状态管理     | 主要由开发者管理           | 支持服务端状态串联                          |
| Agent 能力 | 你自己实现 Agent Loop   | API 原生提供更多 Agent 能力                |
| 工具调用     | Tool Use           | Function Calling + 内置工具            |
| 消息结构     | `messages`         | `input` / `output`                 |
| 多模态      | Content Blocks     | Input/Output Items                 |
| 思考过程     | Extended Thinking  | Reasoning Models / Reasoning Items |
| 适合       | 自定义 Agent、底层框架     | Agent、复杂工作流、工具调用                   |
