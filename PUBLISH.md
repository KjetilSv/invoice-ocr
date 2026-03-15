# Publish recipe (free)

Goal:
- **GUI** published publicly (free) via **Cloudflare Pages**.
- **API** stays on your PC (free) via **Cloudflare quick tunnel**.

This keeps costs at ~0, and avoids needing a fixed IP.

---

## A) One-time: create GitHub repo + push

### 1) Create a new GitHub repo
- Go to GitHub → New repository
- Name suggestion: `invoice-ocr`
- Public or private (public is fine for this MVP)

### 2) Push from your PC
Open PowerShell:

```powershell
cd C:\Code\invoice-ocr

git status

git remote add origin https://github.com/<YOU>/<REPO>.git

git push -u origin main
# if your branch is called master:
# git push -u origin master
```

If GitHub prompts auth: use GitHub Desktop or a PAT.

---

## B) Publish GUI on Cloudflare Pages (free)

### 1) Create Pages project
- Log into Cloudflare dashboard
- Pages → Create a project → Connect to Git
- Pick the `invoice-ocr` repo

### 2) Build settings
- Framework preset: **Next.js** (if available)
- Build command: `npm run build`
- Output directory: leave default / auto

### 3) Environment variables
Add:
- `NEXT_PUBLIC_BASE_URL` = `https://<your-pages-domain>`

(Example: `https://invoice-ocr.pages.dev`)

Deploy.

---

## C) Run local API + tunnel on your PC

### 1) Start local API + tunnel

```powershell
cd C:\Code\invoice-ocr-local-api
.\start-local-api.cmd
```

The script prints:
- `API KEY: ...`
- `TUNNEL URL: https://...trycloudflare.com`

It also writes them to:
- `C:\Code\invoice-ocr-local-api\local-api.runtime.json`

### 2) Stop later

```powershell
cd C:\Code\invoice-ocr-local-api
.\stop-local-api.cmd
```

---

## D) Configure the published GUI to use your local API

1) Open your Pages URL in the browser.
2) Go to: `/admin`
3) Paste:
   - Local API URL: the `trycloudflare.com` URL
   - API key: the printed key
4) Go to: `/app`
5) Upload/take photo → `Run (Local API)`

---

## E) Security hardening (recommended after first publish)

### 1) Lock CORS to your GUI origin
In the same terminal where you start the local API, set:

```powershell
setx ALLOWED_ORIGINS "https://<your-pages-domain>"
```

Then restart the local API + tunnel.

### 2) Rotate API key occasionally
Set a new key:

```powershell
setx INVOICE_OCR_API_KEY "ioc_<something-random>"
```

Restart local API + tunnel, then update `/admin`.

---

## Notes / limitations
- **Quick tunnel URL changes** on restart. That’s expected.
- For a stable API URL you’ll later want a Cloudflare account + named tunnel + a domain/subdomain.
