---
title: 同时维护 Atom 与 RSS 的静态输出
description: 用同一份文章数据生成两种摘要订阅格式，并通过 XSLT 改善浏览器阅读体验。
pubDate: 2026-10-05
collection: 工程
tags: [Atom, RSS, XML]
cover: ../assets/placeholder-04.jpg
---

订阅源首先是给阅读器使用的机器格式，但直接在浏览器里打开时，也应该清楚地告诉读者这是什么以及如何订阅。

## 单一数据来源

Atom 和 RSS 都从正式文章集合读取相同的标题、摘要、日期和永久链接，并统一限制为最近二十篇。

## XSLT 只是显示层

样式表不会改变订阅源语义。阅读器仍然读取标准 XML，浏览器则呈现更友好的文章列表。

## 保持 URL 一致

订阅源、canonical、sitemap 和页面路由必须使用同一种尾部斜杠策略。
