---
title: 把内容、配置与应用代码分开
description: 通过根目录 content、集中配置和领域工具保持博客项目的长期可维护性。
pubDate: 2025-08-02
collection: 工程
tags: [架构, Content Collections]
cover: ../assets/placeholder-10.jpg
---

内容文件不是组件源码。把 Markdown 放在根目录 `content/`，可以让写作材料、媒体资源和应用实现拥有清晰边界。

## 配置保持声明式

站点信息、导航与友链都是数据。日期计算、链接判断和图片处理属于工具函数，不应混进配置文件。

## 类型按领域集中

文章、订阅、导航、页脚和搜索各自拥有独立的类型模块。组件消费已验证的数据，而不是重复猜测字段结构。
