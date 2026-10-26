# Peter Crew — Mathematics

Personal academic website, published with GitHub Pages at <https://p-crew.github.io/>.
Plain HTML, CSS and JavaScript: no framework, no build step.

## Layout

| Path | Contents |
| --- | --- |
| `index.html` | All page content. Maths is written as LaTeX between `\( … \)` (inline) and `\[ … \]` (display). |
| `styles.css` | Colours (custom properties at the top), typography, layout, print styles. |
| `script.js` | Renders the maths with KaTeX and handles the expandable figures. |
| `assets/js/figure-runtime.js` | Small helper that mounts a figure and keeps its markup in sync with its state. |
| `assets/js/figures/*.js` | One file per interactive figure. Each is only downloaded when its button is first pressed. |
| `assets/vendor/katex/` | KaTeX 0.16.11 (MIT licence), served locally: CSS, scripts and `woff2` fonts. |
| `assets/peter-crew-cv.pdf` | CV linked from the page. |
| `assets/favicon.svg`, `assets/social-card.png` | Browser icon and link-preview image. |
| `scripts/serve.mjs` | Local preview server only; not used by GitHub Pages. |

The only external request is the Google Fonts stylesheet (Newsreader, IBM Plex Sans, IBM Plex Mono). If it is unavailable, the page falls back to system fonts.

## Editing

- **Text:** edit `index.html` directly.
- **Adding a figure to a project:** add a button and an empty panel next to the project, e.g.

  ```html
  <button class="tog" type="button" aria-expanded="false" aria-controls="fig-name" data-figure="name" hidden><span class="ic" aria-hidden="true"></span>Interactive figure</button>
  <div class="fig-panel" id="fig-name" hidden></div>
  ```

  and create `assets/js/figures/name.js`, which calls `SiteFigures.register('name', { markup, Component })`. The comment at the top of `assets/js/figure-runtime.js` describes the `data-` attributes the markup can use; the existing figures are working examples.
- **Updating the CV:** replace `assets/peter-crew-cv.pdf`, keeping the file name.

## Local preview

```bash
node scripts/serve.mjs
```

Then open <http://127.0.0.1:4173>. This serves the files the same way GitHub Pages does, so it is the best check before pushing. The scripts are plain (non-module) scripts, so opening `index.html` straight from disk should also work in most browsers.

## Deploying

GitHub Pages is set to **Deploy from a branch**, `main`, folder `/ (root)`. Commit and push to `main`; the deployment appears in the repository's Actions tab and usually takes a minute or two. The empty `.nojekyll` file tells Pages to serve the files as they are.

Notes for Pages:

- File names are case-sensitive on Pages (unlike Windows), so links must match the file name exactly.
- All paths are relative, so the site also works from a project URL or a custom domain. If the domain changes, update the canonical and `og:` URLs and the JSON-LD block in `index.html`, plus `robots.txt` and `sitemap.xml`.
- `tmp/`, `artifacts/` and `.claude/` are local working folders and are excluded by `.gitignore`.

## Figures

The figures run simulations in the browser and are illustrations, not research outputs. Each caption says what is computed and which parameters are illustrative. The trace (ITT22) and scan-path (ITT21) figures use synthetic data only. Animations respect the reduced-motion setting.
