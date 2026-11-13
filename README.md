# Katrina: Four People, One Storm

A class simulation for "Natural Disasters in History" (University of St. Gallen).
Each group opens the website on one phone, picks a person and plays four rounds of Hurricane Katrina.
The projector shows `presenter.html`.

- Player page: `index.html` (the address in the QR code)
- Projector page: `presenter.html` (arrow keys or clicks; `N` notes, `F` full screen, `T` 60-second timer)

It is a plain static website: HTML, CSS and JavaScript, no login, no cookies, no tracking.

## Edit the texts

Every text, choice, price and ending is in **`data.js`**. Open it in any text editor (VS Code, TextEdit in plain-text mode, or directly on GitHub with the pencil icon).

| You want to change | Look for |
|---|---|
| A round's question, "What you know", "What happened in the city", breaking news | `rounds: [` near the top |
| A person's introduction, constraints, real story, presenter table row | `people:` then `mayor`, `herbert`, `kim` or `lake` |
| A situation, "What you hear", a choice, a price, a consequence | inside the person, `rounds: [` (one block per round; in rounds 2 to 4 one block per location, e.g. `home`, `cc`, `roof`) |
| A complication card | `card:` inside a location, or `_card:` for the whole round |
| An ending | `endings:` near the bottom |
| Lines about money, food, strength, Ethel at the end | `endLines:` at the bottom |
| Photos and their credits | `media:` near the top |
| The address on the projector title slide | `publicUrl:` in `meta` |

Keep the quotes, commas and brackets. If the page goes blank after an edit, a comma or quote is usually missing. Open the browser console (right click, Inspect, Console) to see the line.

Choice fields: `t` button text, `cost` dollars, `lock` reason it is impossible, `lockKind` (`'real'` or `'game'`), `c` what happens to you, `loc` new location, `food` / `ethel` / `strength` changes, `minStrength` and `weakLock` for options that need strength, `wait` hours waited (game estimate), `img` a key from `media`, `end` an ending (round 4 only). `{money}` in a text shows the money left.

Tags: `kind: 'real'` shows "From the real story", `'game'` shows "Game detail", `'composite'` shows "Composite".

## Test locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. The automated test (`tests/play_all.py`) plays every person through all rounds on a phone and a laptop viewport:

```bash
pip install playwright && python3 tests/play_all.py
```

## Redeploy

The site is served by GitHub Pages from the `main` branch. After editing:

```bash
git add -A
git commit -m "Update texts"
git push
```

Or edit `data.js` directly on github.com and press "Commit changes". The site updates within about a minute. Phones that already have the page open need a reload.

## Files

`data.js` content · `js/app.js` player logic · `js/presenter.js` projector · `js/sound.js` generated wind and rain · `css/style.css` design · `img/`, `video/` media (see `CREDITS.md`) · `qr.png` QR code · `NOTES_FOR_THE_GROUP.md` game details to approve and facts to check.
