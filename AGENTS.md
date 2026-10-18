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
