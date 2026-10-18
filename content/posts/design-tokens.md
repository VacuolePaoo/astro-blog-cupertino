---
title: 用设计 Token 约束一个长期维护的博客
description: 在 Tailwind CSS v4 中用语义化变量连接颜色、排版、圆角和组件状态。
pubDate: 2026-10-16
updatedDate: 2026-10-18
collection: 前端
tags: [Tailwind CSS, 设计系统]
cover: ../assets/placeholder-02.jpg
---

组件数量不多，不代表不需要设计系统。恰恰因为博客会被长期修改，少量稳定的 token 能避免每个页面逐渐长出自己的视觉语言。

## 先定义语义

颜色变量不应叫“浅灰一号”，而应描述用途，例如背景、正文、弱化文字、边框和强调色。

```css title="global.css" {2-4}
@theme {
  --color-background: #fff;
  --color-foreground: #111;
  --color-accent: #0071e3;
}
```

## 让暗色模式复用结构

暗色主题只替换语义 token 的值。组件不应知道自己位于哪个主题里。

## 圆角和阴影需要节制

卡片、图片和弹窗共享尺度，但允许通过变体表达层级。阴影只用于区分浮层，不用来装饰普通内容。
