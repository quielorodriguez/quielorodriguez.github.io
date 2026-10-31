// Builds dist/ from src/ and data/. Makes no network requests; run fetch-data.mjs first.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const dist = new URL("dist/", root);
const config = JSON.parse(read("site.config.json"));
const site = config.siteUrl;
const today = new Date().toLocaleDateString("en-CA");

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const keywords = {
  swift: ["import", "struct", "private", "let", "var", "some", "func", "return", "nil", "for", "by"],
  ts: ["type", "interface", "function", "const", "return", "new", "true", "false", "null", "string", "boolean", "for", "of", "if"],
};

function highlight(line, lang) {
  const token = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|(\b\d+\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+|.)/g;
  let html = "";
  for (const m of line.matchAll(token)) {
    if (m[1]) html += `<span class="c">${escape(m[1])}</span>`;
    else if (m[2]) html += `<span class="s">${escape(m[2])}</span>`;
    else if (m[3]) html += `<span class="n">${m[3]}</span>`;
    else if (m[4] && keywords[lang].includes(m[4])) html += `<span class="k">${m[4]}</span>`;
    else html += escape(m[0]);
  }
  return html;
}

const examples = {
  hr: ["data/examples/SampleHeartRateCard.swift", "swift"],
  snap: ["src/examples/weekly-snapshot.swift", "swift"],
  pre: ["data/examples/demo-credential-precheck.ts", "ts"],
  gate: ["src/examples/verifier-gates.ts", "ts"],
  life: ["src/examples/lifecycle.ts", "ts"],
};

const arrow =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>';

function calendar() {
  const path = new URL("data/contributions.json", root);
  if (!existsSync(path)) {
    return {
      total: "",
      html: `<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://ghchart.rshah.org/f5f5f7/quielorodriguez">
<img class="cal-fallback" src="https://ghchart.rshah.org/1d1d1f/quielorodriguez" width="663" height="104" loading="lazy" decoding="async" alt="GitHub contribution calendar for the last 12 months">
</picture>`,
    };
  }
  const { total, days } = JSON.parse(readFileSync(path, "utf8"));
  const date = (d) => new Date(`${d}T00:00:00Z`);
  const lead = date(days[0].date).getUTCDay();
  const cells = Array.from({ length: lead }, () => '<i style="visibility: hidden"></i>');
  for (const d of days) {
    const when = date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
    const label = `${d.count} contribution${d.count === 1 ? "" : "s"} on ${when}`;
    cells.push(`<i${d.level ? ` class="l${d.level}"` : ""} title="${label}"></i>`);
  }
  const weeks = Math.ceil(cells.length / 7);
  const months = [];
  let previous = -1;
  for (let w = 0; w < weeks; w++) {
    const first = date(days[Math.max(0, w * 7 - lead)].date);
    const month = first.getUTCMonth();
    if (month !== previous && w < weeks - 2) {
      if (months.length && w - months.at(-1).w < 3) months.pop();
      months.push({ w, name: first.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }) });
    }
    previous = month;
  }
  const monthRow = months.map((m) => `<span style="grid-column: ${m.w + 1}">${m.name}</span>`).join("");
  return {
    total: `${total.toLocaleString("en-US")} contributions in the last year. `,
    html: `<div class="scroll">
<div class="cal" role="img" aria-label="GitHub contribution calendar for the last 12 months, ${total.toLocaleString("en-US")} contributions">
<div class="cal-days" aria-hidden="true"><span></span><span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span></div>
<div class="cal-main">
<div class="cal-months" aria-hidden="true">${monthRow}</div>
<div class="cal-grid" style="grid-template-columns: repeat(${weeks}, minmax(0, 1fr))">${cells.join("")}</div>
</div>
</div>
</div>`,
  };
}

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Quielo Rodriguez",
  jobTitle: "iOS and identity engineer",
  url: site,
  address: { "@type": "PostalAddress", addressLocality: "Vancouver", addressRegion: "BC", addressCountry: "CA" },
  worksFor: { "@type": "Organization", name: "Hanzo Technologies", url: "https://hanzotechnologies.com" },
  knowsAbout: ["Swift", "SwiftUI", "HealthKit", "TypeScript", "Node.js", "OpenID4VCI", "OpenID4VP", "ISO mdoc", "X.509"],
  sameAs: ["https://github.com/quielorodriguez", config.linkedinUrl, "https://hanzotechnologies.com"].filter(Boolean),
};

const cal = calendar();
const values = {
  site,
  css: read("src/style.css"),
  js: read("src/theme.js"),
  jsonld: JSON.stringify(person).replace(/</g, "\\u003c"),
  arrow,
  appStoreLink: config.appStoreUrl
    ? `<a class="btn btn-ink btn-sm" href="${escape(config.appStoreUrl)}">See Hanzo Health on the App Store</a>\n`
    : "",
  calendar: cal.html,
  total: cal.total,
};
for (const [key, [file, lang]] of Object.entries(examples)) {
  const lines = read(file).replace(/\n$/, "").split("\n");
  values[`code:${key}`] = lines.map((l) => `<span class="l">${highlight(l, lang)}</span>`).join("");
  values[`lines:${key}`] = String(lines.length);
}

const html = read("src/index.html").replace(/\{\{([a-z:A-Z]+)\}\}/g, (match, key) => {
  if (!(key in values)) throw new Error(`no value for ${match}`);
  return values[key];
});

rmSync(dist, { recursive: true, force: true });
mkdirSync(new URL("fonts/", dist), { recursive: true });
writeFileSync(new URL("index.html", dist), html);
for (const f of ["geist.woff2", "geist-mono.woff2", "OFL.txt"]) {
  copyFileSync(new URL(`src/fonts/${f}`, root), new URL(`fonts/${f}`, dist));
}
writeFileSync(new URL(".nojekyll", dist), "");
writeFileSync(new URL("robots.txt", dist), `User-agent: *\nAllow: /\nSitemap: ${site}sitemap.xml\n`);
writeFileSync(
  new URL("sitemap.xml", dist),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}</loc>
    <lastmod>${today}</lastmod>
  </url>
</urlset>
`,
);

// Open Graph image: rendered from src/og.html with headless Chrome, reused if Chrome is missing.
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const og = new URL("src/og.png", root);
if (existsSync(chrome)) {
  execFileSync(chrome, [
    "--headless", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--window-size=1200,630", `--screenshot=${og.pathname}`, new URL("src/og.html", root).href,
  ], { stdio: "ignore" });
}
if (existsSync(og)) copyFileSync(og, new URL("og.png", dist));
else console.warn("og.png missing: install Chrome or add src/og.png");

console.log(`built dist/ (${(html.length / 1024).toFixed(1)} KB html, lastmod ${today})`);
