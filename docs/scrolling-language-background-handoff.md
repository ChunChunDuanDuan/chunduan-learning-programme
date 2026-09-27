# Scrolling translucent language backgrounds

The six single-language routes share `src/app/languages/[language]/layout.tsx`. That layout reads `languages[code].background` and renders one `LanguageBackground` for the current language. `/languages`, Cross-language, and other environments sit outside this layout.

Place an artwork file at `public/visuals/languages/{en|de|ru|ja|grc|la}/background.webp`. The exact URL used by the app is `/visuals/languages/{code}/background.webp`. Existing `cover.webp` files remain the visual entry cards on `/languages`; the large cover image was removed from each single-language Overview.

`src/lib/languages/config.ts` owns the paths and `DEFAULT_LANGUAGE_BACKGROUND_OPACITY` (`0.14`). Each language's `background` config also supports `position` (default `top center`) and `repeat` (default `no-repeat`). `src/components/languages/language-background.tsx` is the reusable layer. It checks the image via the existing `visualAsset()` helper before rendering, so a missing file produces a neutral shell without an image request. No artwork is generated or downloaded.

The default no-repeat image has `width: 100%`, `height: auto`, and an absolute layer inside the language content shell. It keeps its aspect ratio and scrolls with the document. The layer is decorative, inaccessible to pointer events, and behind a separate foreground layer. In `src/app/globals.css`, `.language-background-artwork` controls the bottom mask fade (opaque through 65% of the image, transparent at its bottom). If CSS masks are unavailable, the translucent image still works and simply ends without a fade. `.language-surface` and `.language-navigation-surface` hold the shared white surfaces and navigation treatment.

For mobile, the image scales to the language content width without adding page overflow. Existing app and module containers use `min-w-0`; Grammar Tables keep their own horizontal table scroller. Static inspection and tests cover the structure; browser-based iPad/iPhone and live scroll visual checks remain unverified because computer-use approval was blocked in this session.
