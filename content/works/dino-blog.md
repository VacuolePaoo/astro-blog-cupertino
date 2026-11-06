---
title: Dino Blog
description: 基于 Astro 的个人博客，从 Cupertino 主题逐步迁移而来，包含文章、动态、友链与订阅等完整功能。
category: 前端
repo_url: https://github.com/VacuolePaoo/dino-blog-v1
preview_url: https://blog.vacu.top/
cover: https://dinoimg.236668.xyz/file/DWR4byNt.png
badge: Cupertino设计
---

## 简介

Dino Blog 是我目前主力维护的个人博客项目，使用 Astro 构建静态站点，内容以 Markdown 与内容集合管理。

## 特性

- 纯静态输出，构建产物可直接部署到 Vercel
- 文章、动态、友链、归档、搜索等完整页面
- 响应式布局，桌面端与移动端统一的设计语言
- 全站主题令牌驱动的明暗双主题

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | Astro |
| 样式 | SCSS + CSS 自定义属性 |
| 部署 | Vercel |

```ts
export const collections = { articles, works, pages }
```

后续计划包括更多交互细节打磨与性能持续优化。
