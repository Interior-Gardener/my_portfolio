// Warns when public/kartik-verma-resume.pdf has changed since src/data/site.ts
// was last reviewed against it. The PDF and site.ts are two separately
// hand-maintained documents (see DEPLOYMENT_GUIDE.md "Keeping the résumé and
// site.ts in sync") — this can't tell you *what* changed, only *that* the
// file did, so it never blocks dev or build. Run `npm run resume:synced`
// after you've checked site.ts against the new PDF to clear the warning.
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const pdfPath = new URL("../public/kartik-verma-resume.pdf", import.meta.url);
const statePath = new URL("../.resume-sync.json", import.meta.url);
const markSynced = process.argv.includes("--mark-synced");

async function currentHash() {
  try {
    const pdf = await readFile(pdfPath);
    return createHash("sha256").update(pdf).digest("hex");
  } catch {
    return null; // no PDF yet (fresh checkout before first build) — nothing to compare
  }
}

async function readState() {
  try {
    return JSON.parse(await readFile(statePath, "utf8"));
  } catch {
    return null;
  }
}

const hash = await currentHash();
if (!hash) process.exit(0);

if (markSynced) {
  await writeFile(statePath, JSON.stringify({ hash, syncedAt: new Date().toISOString() }, null, 2) + "\n");
  console.log("[resume-sync] Recorded the current résumé PDF as reviewed against site.ts.");
  process.exit(0);
}

const state = await readState();
if (!state || state.hash !== hash) {
  console.warn("");
  console.warn("⚠️  [resume-sync] public/kartik-verma-resume.pdf has changed since src/data/site.ts was last checked against it.");
  console.warn("    Compare the new PDF with site.ts (experience dates/bullets, education, resumeSkills, recognition) and update anything that changed.");
  console.warn("    Then run: npm run resume:synced");
  console.warn("");
} else if (process.env.RESUME_SYNC_VERBOSE) {
  console.log(`[resume-sync] Up to date (checked ${state.syncedAt}).`);
}
