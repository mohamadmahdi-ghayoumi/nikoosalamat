# Nikoosalamat frontend

React + Vite, Persian and right-to-left. The code is organized by site feature.

```text
src/
  app/                    Application composition and route selection
  components/
    layout/               Header, footer, navigation and social links
    ui/                   Shared icons, page hero, content body and notices
  config/                 Navigation and social channel configuration
  features/
    home/                 Homepage sections, slider and fallback content
    products/             Product cards, catalog pages, gallery and filters
    articles/             Magazine cards, metadata and article pages
    content/              Editable category content pages
    about/                Company presentation
    contact/              Contact form, details and FAQ content
    admin/                Management pages, forms and controller hook
  hooks/                  Navigation, page titles, site data, cart and notices
  services/api/           HTTP client and API functions grouped by domain
  styles/                 Ordered global styles and responsive overrides
  utils/                  Formatting and file-reading helpers
  main.jsx                React entry point
```

## Responsibilities

- `app/App.jsx` connects application hooks, layout and routes. Keep page JSX out of it.
- `app/AppRoutes.jsx` maps paths to pages. The existing History API routing behavior is retained.
- Each feature keeps its own `pages`, `components`, `hooks`, `data` or `utils` only where needed.
- Shared layout and UI components do not import page implementations.
- Pages compose components; API requests belong in `services/api`, not inside form markup.
- Admin session state, loading and mutations live in `features/admin/hooks/useAdminController.js`.
- Site content is managed by the existing backend. Fallback content and slider configuration are in `features/home/data`; product fallbacks are in `features/products/data`.
- Images and videos remain in `public/`; user uploads remain on the backend.

## Styles

`styles/index.css` is the only stylesheet imported by the entry point. It preserves the original cascade order. Global tokens and resets are in `base.css`; component/page styles follow; shared responsive overrides load last. Preserve the RTL rules and this ordering when adding styles.

## Commands

Run from `frontend/`:

```sh
npm install
npm run dev
npm run build
npm run format
npm run format:check
```

The development API defaults to `http://127.0.0.1:8011`. Set `VITE_API_URL` when needed. Production uses same-origin requests. No API endpoint or database format is changed by the structural refactor.
