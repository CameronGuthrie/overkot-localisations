# Overkot localisations

These files contain the interface text for the Overkot desktop overlay. English is the source and fallback. The files use Soulframe's language codes, including `zh` for Simplified Chinese, `tc` for Traditional Chinese and `uk` for Ukrainian. The selector displays the native names from [_languages.json](_languages.json).

To suggest a correction, edit the value in your language's JSON file and open a pull request. Give the widget or settings panel where you saw the text. Compare the meaning with [en.json](en.json) and use the terminology in the game. Preserve variables such as `{name}`, `{count}` and `%s` wherever they fit in your translation.

When adding a message, add its key to every language. Run `node scripts/check.cjs` to check the manifest, message coverage and variables. Parts of the current catalogues are machine-assisted. Wording corrections from speakers of each language are welcome.

Overkot pins a revision of this repository at `langs/` and bundles those interface strings for offline use. The app retrieves Soulframe's own item and game text from its CDN.

To register another language, add its dictionary and its entry in `_languages.json`. Use the game's file code for `code` and the native display name for `name`. Set `flag` to a PNG filename in [flags](flags), such as `ua.png`. Add the image there if needed, using the two-letter country code in lowercase. Supply a `locale` for date and number formatting if it differs from the game code. The desktop build uses the same list to include Chromium's language resources. Set `electronLocales` when Chromium uses different names for its packs.
