<h1 align="center">Astro Blog Cupertino</h1>

<p align="center">A reimplementation of <a href="https://github.com/MrWillCom/hexo-theme-cupertino"><strong>Hexo Theme Cupertino</strong></a> rewrite with Astro.</p>

<p align="center"><a href="https://blog.vacu.top/"><strong>Preview</strong></a> / <a href="https://docs.vacu.top/">Docs</a></p>

<p align="center">
  <a href="https://github.com/VacuolePaoo/dino-blog-v1/stargazers">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/VacuolePaoo/dino-blog-v1?style=for-the-badge&logo=github&logoColor=181717&labelColor=EEEEEE&color=F7D76E">
  </a>
  <img alt="Astro" src="https://img.shields.io/badge/Astro-7-BC52EE?style=for-the-badge&logo=astro&logoColor=FFFFFF&labelColor=EEEEEE">
  <img alt="Node" src="https://img.shields.io/badge/Node-%E2%89%A522-339933?style=for-the-badge&logo=nodedotjs&logoColor=FFFFFF&labelColor=EEEEEE">
</p>

<p align="center">✨ <em>Give a star if you like this!</em> ✨</p>

使用Astro框架重构的Cupertino风格博客，看起来像 [Apple Newsroom](https://www.apple.com/newsroom/)

拥有飞快的构建速度、轻量低JS架构、灵活的扩展性、满分SEO、静态资源优化等特点

## 快速开始

确保已安装 [Node.js](https://nodejs.org/) ≥ 22 与 [pnpm](https://pnpm.io/)

```sh
$ git clone https://github.com/VacuolePaoo/dino-blog-v1.git blog
$ cd blog
$ pnpm install
# 启动开发服务器
$ pnpm dev
```

质量检查：

```sh
$ pnpm run format:check
$ pnpm run lint
$ pnpm run check
$ pnpm run build
```

## 配置

替换以下占位内容：

- `blog.config.ts`：站点名、品牌名、描述、标语、生产域名、作者名、版权与许可
- `blog.config.ts` 的 `comments`：部署自己的 Twikoo 实例后填入 `envId` 并开启
- `src/consts.ts`：顶部导航、页脚分组中的站外链接
- `src/friends-links.ts`：替换示例友链为自己的友链数据
- `content/about.md`：关于页正文
- `content/works/`：替换示例作品条目
- `public/favicon.png`：站点图标（`favicon-32.png` 等衍生尺寸由构建脚本自动生成）

## 配置与内容

- `blog.config.ts`：站点元信息、作者、版权、强调色、订阅源、远程图片域名与 Cupertino 主题选项。
- `src/consts.ts`：顶部导航、页脚分组和首页文章数量。
- `src/friends-links.ts`：友链分组与友链数据。
- `src/styles/`：外部 SCSS 设计 token、复用样式与搜索页样式。
- `content/posts/*.md`：文章。
- `content/works/*.md`：作品集条目。
- `content/*.md`：独立页面
- `content/assets/`：由 Astro 优化的本地文章资源。

文章必填 Frontmatter：

```yaml
title: 文章标题
description: SEO、搜索、OG 与订阅摘要
pubDate: 2026-10-18
collection: 前端
```

可选字段：`tags`、`cover`、`coverAlt`、`draft`、`slug`、`excerpt`、`no_comments`、`about`、`extra_info`、`copyright`。

## 部署

生产构建命令为 `pnpm run build`，输出目录为 `dist/`。产物为纯静态文件，可部署到 Vercel 或 Cloudflare Pages。正式部署前必须替换 `blog.config.ts` 中的占位域名、站点名、作者和站外链接。

## 贡献

欢迎一切友好的贡献！可以从现有 issue 或小修复开始。

不熟悉代码也没关系，随时可以报告 bug 或提出建议。

## 致谢

本模板的设计与功能参考了 [MrWillCom](https://github.com/MrWillCom) 的 [Hexo Theme Cupertino](https://github.com/MrWillCom/hexo-theme-cupertino)，在此致以诚挚的感谢。
