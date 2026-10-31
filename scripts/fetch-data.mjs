// Run once per build. Writes data/contributions.json and the two public example files.
// Needs GITHUB_TOKEN, or a logged-in `gh` CLI. If a fetch fails, the last saved copy is kept.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const LOGIN = "quielorodriguez";
const dataDir = new URL("../data/", import.meta.url);
mkdirSync(new URL("examples/", dataDir), { recursive: true });

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  return execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
}

async function gh(path, init = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token()}`, "User-Agent": LOGIN, ...init.headers },
  });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res;
}

const query = `query {
  user(login: "${LOGIN}") {
    contributionsCollection {
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

try {
  const res = await gh("/graphql", { method: "POST", body: JSON.stringify({ query }) });
  const { data, errors } = await res.json();
  if (errors) throw new Error(errors[0].message);
  const c = data.user.contributionsCollection;
  const levels = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
  const days = c.contributionCalendar.weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: levels[d.contributionLevel] })),
  );
  writeFileSync(
    new URL("contributions.json", dataDir),
    JSON.stringify({ total: c.contributionCalendar.totalContributions, days }) + "\n",
  );
  console.log(`contributions: ${c.contributionCalendar.totalContributions} in ${days.length} days`);
  // GitHub only reports restricted (private) counts when the profile shares them.
  if (c.restrictedContributionsCount > 0) {
    console.log(`private contributions included as counts: ${c.restrictedContributionsCount}`);
  } else {
    console.warn(
      `warning: no private contributions reported. If "Include private contributions on my profile" ` +
        `is off, the chart undercounts.`,
    );
  }
} catch (err) {
  console.warn(`contributions not fetched, keeping the last saved copy: ${err.message}`);
}

for (const file of ["SampleHeartRateCard.swift", "demo-credential-precheck.ts"]) {
  try {
    const res = await gh(`/repos/${LOGIN}/${LOGIN}/contents/examples/${file}`, {
      headers: { Accept: "application/vnd.github.raw" },
    });
    writeFileSync(new URL(`examples/${file}`, dataDir), await res.text());
    console.log(`example: ${file}`);
  } catch (err) {
    console.warn(`${file} not fetched, keeping the last saved copy: ${err.message}`);
  }
}
