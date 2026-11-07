## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Project architecture

Organize source code by responsibility:

- `src/components/`: Astro components and the few explicitly required React
  islands, grouped by feature rather than placed in one flat directory.
- `src/layouts/`: shared page and article layouts.
- `src/types/`: project-defined types and interfaces, separated into focused
  modules such as `article.ts`, `feed.ts`, `nav.ts`, `footer.ts`, `friend.ts`,
  `search.ts`, and `config.ts`.
- `src/utils/`: reusable project functions, separated into focused modules such
  as `article.ts`, `date.ts`, `feed.ts`, `image.ts`, `link.ts`, `pagination.ts`,
  and `search.ts`.
- `src/stores/`: shared client-side state only when state genuinely needs to be
  coordinated across components or islands. Prefer local component state or a
  small DOM utility when global state is unnecessary.

Keep build-time utilities and browser-only utilities clearly separated. A
build-time module must not import code that reads `window`, `document`,
`localStorage`, or other browser globals. Browser utilities must guard access to
browser-only APIs and preserve progressive enhancement.

## Functions and utilities

Every project-owned function that has plausible reuse outside its original
component belongs in `src/utils/`, not inside an `.astro`, `.tsx`, or route file.
Keep one-off rendering expressions local, but extract parsing, formatting,
sorting, filtering, URL handling, image handling, pagination, date handling,
feed generation, and search preparation into domain utilities.

Prefer small pure functions with explicit inputs and return values. Avoid hidden
global state and avoid coupling utilities to component implementations. Use an
options object when a function has several optional arguments. Add concise
JSDoc comments for behavior with non-obvious rules, fallbacks, thresholds, or
sentinel values.

Do not create catch-all files such as `helpers.ts`, `common.ts`, or `misc.ts`.
Name utility modules after their domain. Reuse an existing utility before adding
a similar implementation elsewhere.

## Types

Place project-defined named `type`, `interface`, and `enum` declarations in the
appropriate module under `src/types/`. This includes article/frontmatter, feed,
navigation, footer, friend-link, search, configuration, and reusable component
contracts. Framework-generated types and unavoidable ambient declarations may
remain in their framework-standard declaration files.

Use `import type` for type-only imports. Import types from their focused module
instead of creating an indiscriminate global barrel. Derive types from schemas
or constant data where practical instead of maintaining duplicate unions by
hand.

Configuration and data modules must use `satisfies` to validate their shapes
without losing literal inference. Avoid broad type assertions, `any`, and
duplicated interfaces. Validate external or authored data at its boundary, then
use the validated type throughout the rest of the application.

## Configuration and data boundaries

- `blog.config.ts` contains site-wide metadata and behavior configuration.
- `src/consts.ts` contains typed navigation, footer groups, and stable UI
  constants.
- `src/friends-links.ts` contains typed friend-link groups and entries.
- `src/content.config.ts` owns the article collection loader and frontmatter
  schema.

Keep these files declarative. Move calculations, transformations, generated
values, and parsing into `src/utils/`. Do not mix data declarations with DOM or
component logic.

## State and interactions

Give each interactive feature one clear owner. Related open/close state must be
coordinated so mutually exclusive overlays cannot remain open together. Shared
interaction APIs should expose small operations such as `open`, `close`, and
`toggle`, and must consistently handle Escape, navigation, focus restoration,
and cleanup.

Keep feature-local state within the component or island that owns the feature.
Promote state to `src/stores/` only when multiple independent consumers need to
read or update the same state. Theme persistence and lightweight Astro component
interactions should use focused browser utilities and semantic HTML.

## Code style

Use descriptive domain names and keep modules narrowly focused. Prefer early
returns, immutable transformations, and explicit fallback behavior. Keep
configuration lists in stable, reviewable order where ordering is not part of
the UI contract.

Components should orchestrate rendering. They should not contain duplicated
business rules for article visibility, ordering, dates, URLs, feeds, search
documents, image sources, or pagination; those rules belong in typed utilities.

<!-- task-decomposer:plan:start -->

## 执行计划：GitHub + ESA 静态资源发布

- 终极目标：创建私密资源仓库 `shennhus/vacuoss`，让当前 Astro 项目仅发布版本化的 `dist/_astro`，并在任意稳定状态保留当前生产版本和上一生产版本。
- 任务类型：系统集成与发布链路改造。
- 关键决策与假设：目标仓库由 ESA Pages 作为纯静态目录托管；资源状态以显式 metadata 为准；候选发布阶段保留 `current + candidate`，生产提升后保留 `current + previous`；常规发布仅抽样检查一个资源且不执行生产页面二次验证，只在存在未决 `candidate` 时读取生产状态用于故障恢复；生产 CDN 未验证前不启用默认资源前缀。
- 范围外事项：不迁移 HTML、OG、favicon、feed、manifest 和搜索索引；不重写 Git 历史；不在缺少 ESA 域名或主站发布控制权时切换生产流量。

### 步骤清单

- [x] 1. 扫描仓库并确认现有构建、部署和资源边界（项目扫描、部署配置）｜依赖：无｜验证：仓库扫描与只读审计结果
- [x] 2. 通过 GitHub UI 创建并重命名私密仓库 `shennhus/vacuoss`｜依赖：1｜验证：仓库 URL 可访问且 Visibility 为 Private
- [x] 3. 初始化资源仓库的 ESA 纯静态配置、发布 metadata 和健康检查文件（目标仓库）｜依赖：2｜验证：JSON 可解析、仓库只包含预期初始文件
- [x] 4. 增加 Astro 构建期 CDN 前缀覆盖，同时保留本地无 CDN 回退（`astro.config.mjs`）｜依赖：1｜验证：带测试前缀构建后 HTML/CSS 全部引用版本化 `/_astro` URL
- [x] 5. 实现两版本资源状态机、路径安全校验和失败恢复（`scripts/cdn-assets.mjs`）｜依赖：3｜验证：Node 行为测试覆盖首次发布、候选替换、提升、路径穿越和事务回滚
- [x] 6. 接入项目脚本和 GitHub Actions 资源发布骨架（`package.json`、`.github/workflows/`）｜依赖：4、5｜验证：format、lint、check、build 和 workflow 静态检查通过
- [!] 7. 配置最小权限跨仓库写入凭据与仓库变量｜依赖：2、6｜阻塞：当前 GitHub 账号无源仓库设置权限，且永久 Deploy Key 仍待动作点确认｜验证：手动 workflow 能向目标仓库推送候选提交
- [!] 8. 将目标仓库接入 ESA Pages、自定义域名、缓存和 CORS，并验证真实资源响应｜依赖：3、7｜进度：ESA Pages 项目已创建且首次部署成功；阻塞：待确定资源域名并配置生产规则｜验证：抽样的版本化 `_astro` 资源可成功访问
- [ ] 9. 接入主站候选发布/晋升顺序并完成端到端演练｜依赖：8｜验证：资源先就绪、主站后切换、metadata 正确提升且目标仓库最终仅有两个版本

<!-- task-decomposer:plan:end -->
