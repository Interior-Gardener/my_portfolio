# Kartik Verma Portfolio — Free Deployment Guide

**Prepared:** 2026-09-14
**Goal:** Put the portfolio online for ₹0/month with every feature working: all pages, light/dark themes, animations, the résumé viewer, Gesture Mode and the "Ask AI" assistant.
**Recommended host:** **Cloudflare Pages** (free, unlimited static bandwidth, commercial use allowed, and the AI function is already verified to compile for it).
**Alternative host:** Vercel Hobby (free, but limited to personal, non-commercial use).

---

## 0. Executive summary

The site is a static Astro build plus **one** small serverless function (`/api/chat`) that talks to Groq. Static hosting is free and unlimited on Cloudflare Pages, so the only things that can ever "run out" are the function and the Groq quota, and both are sized comfortably for a portfolio:

| Piece | What runs it | Free allowance | How the site stays inside it |
|---|---|---|---|
| Pages, images, fonts, résumé PDF, hand-tracking model | Cloudflare Pages static hosting | Free and unlimited | Nothing to do |
| `/api/chat` (the assistant) | Cloudflare Pages Function (`functions/api/chat.ts`) | 100,000 requests/day, shared with Workers | Only called when a visitor asks a question |
| AI answers | Groq API | 1,000 requests/day and 30/minute **per model**, per Groq account | Two keys × two models rotate automatically; each visitor is limited to 8 questions/minute and 60/hour |
| Gesture Mode | The visitor's own browser (MediaPipe, on-device) | No server cost at all | Camera frames never leave the device |

With both keys and both models (`openai/gpt-oss-20b`, falling back to `openai/gpt-oss-120b`), the assistant can answer thousands of questions a day. If Groq's limits are ever reached, the site keeps working and the assistant shows a friendly "try again in a minute" message.

**Do Section 1 first.** It is a security step, not a hosting step.

---

## 1. Before anything else: rotate the Groq keys

The two Groq API keys were pasted into a chat conversation while building the site, so treat them as exposed.

1. Open <https://console.groq.com/keys>.
2. Create **two new keys**. For double the free quota, create them in **two different Groq accounts**, since limits are per account.
3. Delete the two old keys.
4. Put the new keys in your local `.env` file (one line, comma-separated):
   ```
   GROQ_API_KEYS=gsk_new_key_one,gsk_new_key_two
   GROQ_MODEL=openai/gpt-oss-20b
   ```
5. Only ever put keys in `.env` locally and in the hosting dashboard. `.env` is already excluded by `.gitignore`, so it can never be pushed to GitHub.

**Also worth doing:** your public repo `Industrial_Asset_Management_System-JSW-Steel` contains a hardcoded Oracle username, password and an internal JSW IP address in `config.py` and `routes/br.py`. Make that repository **private** on GitHub (Settings → General → Danger Zone → Change visibility). The portfolio deliberately does not link to it.

---

## 2. Final content checks (5 minutes)

Everything the site says lives in one file: `src/data/site.ts`. The home page, case studies, résumé page **and** the AI assistant's knowledge are all generated from it, so one edit updates everything.

- [ ] **Claidroid dates.** The site shows `Dec 2024 – Jan 2025 · Jun 2025 – Jul 2025` (search for `Claidroid` in `site.ts`). Confirm or correct them.
- [ ] **Availability line.** `profile.availability` says "Open to software & ML internships".
- [ ] **Résumé PDF.** `public/kartik-verma-resume.pdf` is the file visitors download. The current PDF still has "Dec **20205**", "Letter's of appreciations", and Claidroid dates that overlap JSW. Fix the PDF, export it again and replace the file with the same name.
- [ ] **Phone number.** The PDF includes your phone number; the web résumé intentionally does not. Remove it from the PDF if you don't want it public.

---

## 3. Test locally

```bash
npm install
npm run dev
```

Open <http://localhost:4321>. The assistant works locally because the dev server runs the same `server/chat.ts` code the hosts use.

Then run the production build exactly as the host will:

```bash
npm run build
```

It must end with `0 errors` and `Complete!`.

---

## 4. Push the code to GitHub

1. Create a new **empty** repository on GitHub, for example `portfolio`. Don't add a README or `.gitignore`.
2. In the portfolio folder:
   ```bash
   git init -b main
   git add .
   git status
   ```
3. **Check the `git status` list before committing.** It must **not** contain `.env`, `node_modules/`, `dist/`, or any of the raw photo folders (`Industrial asset management screenshots/`, `my photos/`, etc.). All of these are ignored by `.gitignore`. It **should** contain `public/mediapipe/hand_landmarker.task` (about 7.6 MB, needed for Gesture Mode).
4. Commit and push:
   ```bash
   git commit -m "Portfolio: initial release"
   git remote add origin https://github.com/<your-username>/portfolio.git
   git push -u origin main
   ```

---

## 5. Deploy on Cloudflare Pages (recommended)

### 5.1 Create the project

1. Sign in at <https://dash.cloudflare.com> (a free account is enough).
2. Go to **Workers & Pages → Create → Pages → Connect to Git** (Cloudflare sometimes words this "Import an existing Git repository").
3. Authorise GitHub and pick the `portfolio` repository.
4. **Project name:** this becomes your free address, `<project-name>.pages.dev`. Try `kartikverma`; if it's taken, try `kartikverma-portfolio`.

### 5.2 Build settings

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(leave empty)* |

### 5.3 Environment variables

Under **Environment variables** (or **Settings → Variables and Secrets** after creation), add these for **Production** and **Preview**:

| Name | Value | Type |
|---|---|---|
| `GROQ_API_KEYS` | `gsk_new_key_one,gsk_new_key_two` | **Secret / Encrypt** |
| `GROQ_MODEL` | `openai/gpt-oss-20b` | Plain text (optional) |
| `SITE_URL` | `https://<project-name>.pages.dev` | Plain text |
| `NODE_VERSION` | `22` | Plain text |

`SITE_URL` makes canonical links, the sitemap and social-preview images point at your real address. Cloudflare's build image already defaults to Node 22.16; setting `NODE_VERSION` just pins it.

### 5.4 Deploy

Click **Save and Deploy**. The first build takes 2–4 minutes. Cloudflare automatically finds `functions/api/chat.ts` and publishes it at `/api/chat`; no extra configuration is needed.

> If you add or change environment variables **after** a deployment, they only take effect on the **next** deployment. Use **Deployments → ⋯ → Retry deployment**.

### 5.5 Security headers

`public/_headers` is applied automatically by Cloudflare Pages. It sets `nosniff`, a strict referrer policy, blocks the site from being framed, allows the camera only for this site (Gesture Mode), and caches hashed assets for a year.

---

## 6. Alternative: deploy on Vercel Hobby

Use this only if you prefer Vercel. The Hobby plan's fair-use rules restrict it to **personal, non-commercial use**. A portfolio qualifies, but a donation link (Buy Me a Coffee) is a grey area, and Cloudflare avoids the question entirely.

1. Sign in at <https://vercel.com> with GitHub → **Add New… → Project** → import `portfolio`.
2. Framework preset: **Astro**. Build command `npm run build`, output directory `dist`.
3. Environment variables: the same `GROQ_API_KEYS`, `GROQ_MODEL` and `SITE_URL` (use `https://<project>.vercel.app`).
4. Deploy. Vercel publishes `api/chat.ts` as a function at `/api/chat` and applies the headers in `vercel.json`.
5. **Test the assistant immediately** (Section 7, step 4). The Vercel entry point was not exercised by a real deployment during the build, unlike the Cloudflare one.

Hobby includes 1,000,000 function invocations a month, far more than the assistant needs.

---

## 7. After deploying: verification checklist

1. **Pages load:** `/`, `/work/geoswipe`, `/work/atomix`, `/work/hospital-ops-sync`, `/resume`, and any made-up URL (should show the "Signal lost." 404 page).
2. **Theme:** the toggle switches light/dark with the circular reveal, and the choice survives a reload.
3. **Résumé:** "Original PDF" shows the PDF; "Download PDF" downloads it; "Print" gives a clean one-column print.
4. **Assistant:** open **Ask AI** and ask "What did Kartik build at JSW Steel?". You should see an answer stream in within a couple of seconds. A message saying the assistant "hasn't been configured" means `GROQ_API_KEYS` is missing: add it and redeploy.
5. **Gesture Mode:** click the hand icon → Start camera → allow access. An open palm moves the lime cursor and an OK sign clicks. This needs HTTPS, which `*.pages.dev` and `*.vercel.app` provide.
6. **Social preview:** paste your URL into <https://www.opengraph.xyz> and check that the Kartik Verma card appears.
7. **Speed:** run PageSpeed Insights (<https://pagespeed.web.dev>). Locally, Lighthouse mobile scored 91–95 performance, 95+ accessibility, and 100 best practices and SEO.

---

## 8. Staying inside the free tiers

- **Static traffic** never costs anything on Cloudflare Pages, however many recruiters visit.
- **Each assistant question** is one function request and one Groq request. Even 1,000 questions a day uses 1% of Cloudflare's daily function allowance.
- **Groq limits** are per model and per account: 30 requests/minute and 1,000/day for each of `gpt-oss-20b` and `gpt-oss-120b`. The server tries the fast model on each key first, then the larger model on each key, before telling the visitor to wait.
- **Abuse protection built into `server/chat.ts`:** requests from other websites are rejected (same-origin check); each visitor gets at most 8 questions a minute and 60 an hour; messages are capped at 800 characters and conversations at 12 messages; answers are capped at 700 tokens. The per-visitor counter lives in each function instance's memory, so it's best-effort rather than global, which is fine at portfolio scale.

---

## 9. Updating the site later

| To change… | Edit… |
|---|---|
| Any text, project, metric, internship, award, skill or link | `src/data/site.ts` (also updates the AI's knowledge) |
| Screenshots and captions | Images in `src/assets/work/<project>/`, captions in `src/lib/media.ts` |
| Photos | `src/assets/photos/` and `src/lib/media.ts` |
| Résumé PDF | Replace `public/kartik-verma-resume.pdf` (keep the name) |
| Colours, fonts, spacing | `src/styles/global.css` (theme tokens are at the top) |
| Assistant rules | `server/knowledge.ts` |

After editing: `npm run build` locally, then `git add . && git commit -m "Update content" && git push`. Cloudflare redeploys automatically in a few minutes.

---

## 10. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Build fails at `astro check` | A TypeScript error in something you edited. Run `npm run build` locally to see the exact file and line. |
| Assistant: "hasn't been configured yet" | `GROQ_API_KEYS` isn't set for that environment (Production vs Preview). Add it and redeploy. |
| Assistant: "Lots of questions right now" | Groq's per-minute or per-day limit was hit on every key and model. It recovers automatically; add a key from another Groq account for more headroom. |
| Assistant: "having trouble right now" | A Groq outage or an invalid `GROQ_MODEL`. Remove `GROQ_MODEL` to fall back to the default. |
| Gesture Mode: "needs a secure connection" | You opened the site over plain `http://` on a network address. Use the `https://` deployment URL. |
| Gesture Mode: "couldn't start on this device" | Check that `public/mediapipe/hand_landmarker.task` was committed; `npm run build` copies the rest of the runtime automatically. |
| Old content after pushing | Check the Deployments tab shows the new commit, then hard-refresh (Ctrl+Shift+R). |

---

## 11. Optional: a custom domain later

If you buy a domain (for example `kartikverma.dev`), add it under **Pages project → Custom domains**. Cloudflare issues the HTTPS certificate automatically. Then update `SITE_URL` to the new address and redeploy.
