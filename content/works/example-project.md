---
title: 示例项目
description: 一个占位作品条目，展示作品页的卡片与详情弹窗效果，替换为你自己的项目即可。
category: 示例
repo_url: https://github.com/your-name/your-project
preview_url: https://example.com/
cover: https://astro.build/favicon.svg
badge: 示例
---

## 简介

这是作品集合（`content/works/`）的示例条目。删除或替换为你的真实项目后，作品页会自动列出所有条目。

## 字段说明

- `title` / `description` / `category`：必填，用于卡片与弹窗展示
- `repo_url`：必填，项目仓库链接
- `preview_url`：可选，在线预览链接
- `cover`：可选，卡片封面；远程域名需加入 `blog.config.ts` 的 `imageDomains`
- `badge`：可选，卡片角标文字
