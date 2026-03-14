# invoice-ocr (minimal)

Super enkel webapp: last opp/ta bilde av faktura → kopier betalingsfelt.

## Run locally

1) Add OpenRouter key:

Create `C:\Code\invoice-ocr\.env.local` with:

```
OPENROUTER_API_KEY=sk-or-...
```

2) Start dev server:

```bash
npm run dev
```

Open: http://localhost:3000

## Features

- AI scan via OpenRouter (`openrouter/auto`) using `/api/scan`
- Free fallback OCR via `tesseract.js`
- Auto-detect mode: Norway (KID/konto) vs IBAN vs generic
- Daily quota stored in localStorage:
  - 3 free scans/day
  - Donate button adds +10 bonus scans for that day (honor-system MVP)

## Notes

- Mobile camera preview (getUserMedia) requires HTTPS or localhost; file input capture works on mobile.
