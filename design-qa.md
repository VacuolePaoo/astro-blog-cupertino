# Design QA

## Comparison target

- Source: `https://blog.mrwillcom.com/`
- Source captures: `C:/Users/Dinosaur/.codex/visualizations/2026/10/16/01a14526-b8f4-73d1-a48a-f7dd00eeb3c9/mrwill-reference/`
- Implementation: `http://localhost:4321/`
- Implementation captures: `C:/Users/Dinosaur/.codex/visualizations/2026/10/16/01a14526-b8f4-73d1-a48a-f7dd00eeb3c9/dino-blog-typography-v2/`
- States: light theme; homepage, article, and archive; initial and fully scrolled states.
- Desktop viewport: `1440 × 1000` CSS px, device scale factor `1`.
- Mobile viewport: `390 × 844` CSS px, device scale factor `1`.
- Density normalization: source and implementation were both captured at `1×`; no resampling was required for focused comparisons.

## Pixel dimensions

| Surface                        |      Source | Implementation |
| ------------------------------ | ----------: | -------------: |
| Homepage desktop               | 1440 × 3101 |    1440 × 2796 |
| Article desktop                | 1440 × 6241 |    1440 × 2542 |
| Archive desktop                | 1440 × 2831 |    1440 × 2441 |
| Homepage mobile implementation |           — |     390 × 3909 |

Full-page heights differ because the sites contain different articles and different amounts of article body content. Width, density, and viewport were matched before judging typography.

## Full-view evidence

- Reference homepage: `mrwill-reference/home-desktop-scrolled.png`
- Reference article: `mrwill-reference/article-desktop.png`
- Reference archive: `mrwill-reference/archive-desktop-scrolled.png`
- Implementation homepage: `dino-blog-typography-v2/home-desktop.png`
- Implementation article: `dino-blog-typography-v2/article-desktop.png`
- Implementation archive: `dino-blog-typography-v2/archive-desktop.png`
- Corresponding mobile captures are present in both directories.

## Focused typography evidence

Focused comparisons were required because full-page captures render text too small for reliable weight and line-height judgment.

- Article card: `typography-focus/compare-card.png`
- Article header: `typography-focus/compare-article-header.png`
- About card: `typography-focus/compare-about.png`

Computed styles were also measured in Chromium on both sites. The implementation now matches the reference values for:

- body: 16px / 400 / normal;
- navigation title: 20px / 500;
- navigation links: 16px / 400;
- hero: 22px / 200 and 20px / 400;
- section title: 32px / 700 / 36px;
- card category, title, date: 11px / 600, 24px / 700 / 28px, 14px / 600 / 18px;
- article category, date, title: 13px / 600, 16px / 600, 48px / 700;
- article body: 19px / 400 / 27px;
- article H1–H6: 36, 30, 26, 20, 16, and 14px at weight 700;
- About title/details/tags: 24px / 700, 16px / 400, 14px / 400;
- adjacent-post label/title: 16px / 400 and 18.72px / 700;
- footer title/link/theme control: 17px / 700, 16px / 400, 12px / 400.

All matched elements use normal letter spacing, as in the reference.

## Findings

- P0: none.
- P1: none.
- P2: none after the typography correction pass.
- P3: the reference supports per-article font-family overrides on a few individual posts. The implementation intentionally keeps the configured site-wide `Inter Variable, sans-serif, system-ui` stack and copies the reference site's default typography rather than adding new frontmatter fields.

## Comparison history

### Pass 1

- P2: local navigation and footer text were smaller than the reference.
- P2: local card and archive titles rendered at weight 400 instead of 700.
- P2: the implementation added negative letter spacing absent from the reference.
- P2: mobile article body/title/archive title were reduced to 17/36/40px instead of retaining the reference's 19/48/48px values.
- P2: article headings used a tighter line-height and several used weight 600 instead of 700.

### Fixes

- Replaced relative and clamp-based typography with the measured reference values.
- Removed non-reference letter spacing.
- Restored reference font weights and inherited line-height behavior.
- Applied the same typography on desktop and mobile where the reference does not define a smaller breakpoint value.
- Extended the reference values to navigation, pagination, footer, search results, secondary pages, and article support components.

### Pass 2

- Computed values matched the source mappings above.
- Focused card, article-header, and About-card comparisons showed no actionable P0/P1/P2 typography mismatch.
- All six main route/viewport captures completed without console errors or horizontal overflow.
- Collection filtering, heading anchors, theme persistence, and search remained functional.

## Verification

- `pnpm format:check`: passed.
- `pnpm lint`: passed.
- `pnpm check`: passed with 0 errors, 0 warnings, and 0 hints.
- `pnpm build`: passed; 20 static pages built.

## Navigation blur and footer theme switch

- Source visual truth: `C:/Users/Dinosaur/.codex/visualizations/2026/10/16/01a14526-b8f4-73d1-a48a-f7dd00eeb3c9/nav-footer-v3/source-*.png`
- Implementation screenshots: `C:/Users/Dinosaur/.codex/visualizations/2026/10/16/01a14526-b8f4-73d1-a48a-f7dd00eeb3c9/nav-footer-v3/local-*.png`
- Combined evidence:
  - `nav-footer-v3/compare-nav-desktop.png` (`2904 × 224`)
  - `nav-footer-v3/compare-footer-desktop.png` (`2904 × 1044`)
  - `nav-footer-v3/compare-nav-mobile-open-v2.png` (`804 × 888`)
- Viewports: desktop `1440 × 1000`, mobile `390 × 844`, device scale factor `1`.
- States: light theme, navigation over scrolled content, footer with light selected, and mobile navigation expanded.
- Density normalization: source and implementation were captured at `1×` using equal CSS viewports.

### Fidelity review

- Typography: existing reference-matched navigation and footer sizes remain unchanged.
- Spacing and rhythm: the footer switch uses the reference's `1px` border, `1px` inner padding, `1px` segment gap, and `16px` top margin. The selected capsule sits one pixel from the outer border.
- Color and tokens: the six blur layers use 20% of the active page background; the switch uses the configured accent and white selected content.
- Image quality: no image assets are used by these controls; Lucide sun, moon, and monitor icons remain vector-sharp.
- Copy: Chinese theme labels and the previously specified navigation groups are intentional product-specific differences.

### Comparison history

- Pass 1 P1: the pre-existing mobile menu `top: 100%` positioning placed all links below the viewport after the long blur mask was added.
- Fix: positioned the fixed mobile menu at `top: var(--header-height)` while retaining its viewport-height scrolling region.
- Pass 2: all eight mobile navigation links plus search were visible; desktop blur-layer heights matched the reference (`100`, `83.32`, `69.44`, `57.85`, `48.21`, `40.18px`); no horizontal overflow or console errors remained.

### Interaction verification

- Light, dark, and automatic theme states update `aria-pressed`, persisted storage, and the root dark class correctly.
- Mobile navigation opens, closes with Escape, and keeps all required grouped links reachable.
- `pnpm format:check`, `pnpm lint`, `pnpm check`, and `pnpm build` passed.

final result: passed
