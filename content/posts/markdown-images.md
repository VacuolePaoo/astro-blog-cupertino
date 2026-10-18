---
title: 为原生 Markdown 增加克制的图片宽度语法
description: 使用 URL fragment 表达图片宽度，同时保持 Markdown 在其他阅读器中可用。
pubDate: 2026-09-20
collection: 前端
tags: [Markdown, 图片]
cover: ../assets/placeholder-06.jpg
---

文章图片默认与正文同宽，但教程、截图和摄影作品偶尔需要不同的展示尺度。为此不必立即迁移到 MDX。

## 百分比宽度

图片链接可以附带 `#width=75%`。百分比以 800px 的正文限制宽度为基准，也允许超过 100%。

![较窄的抽象示例图](../assets/cover-6.png#width=62.5%)

## 全视口宽度

`#width=wide` 表示突破内容容器，延伸至视口宽度，同时保持移动端不产生横向滚动。

![全宽抽象示例图](../assets/cover-6.png#width=wide)
