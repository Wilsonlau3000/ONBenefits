# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ontario Benefits Finder — a fully static, client-side educational prototype that helps Ontario residents understand government and non-government benefits they may be eligible for. Bilingual: English and Simplified Chinese (zh-Hans).

**No build system, no framework, no dependencies.** Vanilla HTML/CSS/JavaScript (ES6+).

## Running Locally

Open `index.html` directly in a browser, or serve with:
```
python -m http.server 8080
```
No tests, linting, or build steps exist.

## Architecture

Three files form a clean separation of concerns:

- **engine.js** (~1,660 lines) — Benefit catalog (44 benefits) and all matching logic. The `evaluateAll(profile)` function is the core: it takes a normalized profile and returns an array of result objects with status (ELIGIBLE/POSSIBLE/NEEDS/NOT), bilingual reasoning, estimated max help amounts, and links.
- **app.js** (~265 lines) — UI rendering and event handling. `collectRaw()` gathers form inputs, `normalizeProfile()` converts them to typed values, results are rendered as HTML card elements with filtering/sorting.
- **i18n.js** (~248 lines) — Custom i18n system using `data-i18n` attributes on DOM elements. Dictionary keyed by `"en"` and `"zh-Hans"`. Language stored in `localStorage` key `obf_lang`.

Data flow: `collectRaw() → normalizeProfile() → evaluateAll() → renderSummary() + renderResults()`

## Key Globals

- `window.BENEFITS_ENGINE` — exposes `evaluateAll`, `BENEFITS` catalog, and helpers
- `window.__LANG` / `window.__I18N` — current language code and dictionary
- `window.__PROFILE_FOR_MAXHELP` — cached profile for max-help calculations

## Benefit Result Object Shape

Each result from `evaluateAll()` contains:
- `id`, `name`, `name_zh`, `category`, `category_zh` — identity
- `status` — one of `"ELIGIBLE"`, `"POSSIBLE"`, `"NEEDS"`, `"NOT"`
- `why` — array of `{en, zh}` reasoning strings
- `missing` — array of missing info field names
- `notes` — array of `{en, zh}` additional context
- `max_help` — estimated dollar amount (heuristic)
- `links` — array of `{url, title, title_zh}` official links

## How to Add a New Benefit

1. Add an object to the `BENEFITS` array in `engine.js` with: `id`, `name`, `name_zh`, `category`, `category_zh`, `desc`, `desc_zh`, `links`
2. Add evaluation logic in the `evaluateAll()` function in `engine.js`
3. Add any new UI label translations to both `I18N.en` and `I18N["zh-Hans"]` in `i18n.js`

## How to Add a New Form Field

1. Add the `<input>` or `<select>` in `index.html` with a unique `id`
2. Read it in `collectRaw()` in `app.js`
3. Normalize it in `normalizeProfile()` in `engine.js`
4. Add i18n keys for label/placeholder/options in `i18n.js`
5. Use the normalized value in `evaluateAll()` for affected benefits

## Important Conventions

- All user-facing strings must have both English and Chinese versions (use `msg(en, zh)` helper in engine.js)
- Income thresholds are hardcoded approximations — always note the source/date when updating
- The `estimateChance()` function is a heuristic (base 50%, +42% for ELIGIBLE, -8% per missing field) — it's explicitly not authoritative
- `escapeHtml()` is used to sanitize output — always use it for any user-derived content rendered as HTML
- localStorage key `obf_profile_v1` stores the user's saved form inputs as JSON

## Styling

Dark theme using CSS custom properties: `--bg`, `--card`, `--text`, `--accent`, `--ok`, `--maybe`, `--needs`, `--no`. Responsive grid layout (3 → 2 → 1 columns at 950px and 600px breakpoints).
