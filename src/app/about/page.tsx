export const metadata = {
  title: 'About — Invoice OCR',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold">About</h1>
      <p className="mt-3 text-gray-700">
        <b>Invoice OCR</b> er en super-enkel side for å hente ut betalingsdetaljer fra en faktura (bilde/skjermbilde)
        slik at du kan kopiere KID/kontonummer/IBAN raskt.
      </p>

      <h2 className="mt-6 text-xl font-semibold">Hvordan det funker</h2>
      <ul className="mt-2 list-disc pl-6 text-gray-700 space-y-1">
        <li>
          <b>Run (AI)</b> sender bildet til en AI-modell via OpenRouter (default: <code>openrouter/auto</code>) og
          får tilbake strukturerte felt.
        </li>
        <li>
          <b>Run (free OCR)</b> kjører OCR i nettleseren med <code>tesseract.js</code> som en gratis fallback.
        </li>
        <li>
          Appen prøver å auto-detecte format (Norge KID/konto vs IBAN vs generic) basert på det som finnes i teksten.
        </li>
      </ul>

      <h2 className="mt-6 text-xl font-semibold">Monetization (MVP)</h2>
      <p className="mt-2 text-gray-700">
        MVP-en har en enkel dagskvote (lagres lokalt i browseren din): 3 gratis AI-scans per dag. "I donated" gir +10
        scans den dagen (honor-system i v0.1).
      </p>

      <h2 className="mt-6 text-xl font-semibold">Kontakt</h2>
      <p className="mt-2 text-gray-700">Hvis du vil bidra eller gi feedback: legg inn en issue / send en melding.</p>

      <p className="mt-8 text-sm text-gray-500 flex gap-3">
        <a className="underline" href="/">← Home</a>
        <a className="underline" href="/app">Open app</a>
      </p>
    </main>
  );
}
