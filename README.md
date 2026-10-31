# Portfolio

One static page for GitHub Pages. No framework, no dependencies beyond Node 20+.

```
node scripts/fetch-data.mjs   # contributions + examples 1 and 2 from GitHub, saved to data/
node scripts/build.mjs        # writes dist/; no network
python3 -m http.server 4173 --directory dist
```

`fetch-data.mjs` uses `GITHUB_TOKEN`, or the logged-in `gh` CLI. If a fetch fails, the last saved copy in `data/` is used.

`site.config.json` holds the real URLs. An empty `appStoreUrl` leaves the App Store button out; an empty `linkedinUrl` leaves LinkedIn out of the JSON-LD.

`og.png` is rendered from `src/og.html` with headless Chrome during the build.

Geist and Geist Mono are self-hosted under the SIL Open Font License (`src/fonts/OFL.txt`).
