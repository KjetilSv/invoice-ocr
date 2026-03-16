import Link from 'next/link';
import LangGate from '@/components/LangGate';

export const metadata = {
  title: 'Invoice OCR — copy payment details fast',
  description:
    'Fast invoice scanner: upload a photo/screenshot and copy payment fields (KID, account number, IBAN, amount). Privacy-first MVP.',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto p-6">
        <header className="pt-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">Invoice OCR</h1>
              <div className="lang lang-en">
                <p className="mt-3 text-lg text-gray-700">Super simple: take a photo / upload → copy payment fields.</p>
                <p className="mt-2 text-sm text-gray-600">
                  Supports Norway-style invoices (KID + 11-digit account), IBAN invoices, and generic references.
                </p>
              </div>
              <div className="lang lang-no">
                <p className="mt-3 text-lg text-gray-700">Super enkelt: ta bilde / last opp → kopier betalingsfelt.</p>
                <p className="mt-2 text-sm text-gray-600">
                  Støtter norske fakturaer (KID + 11-sifret kontonr), IBAN-fakturaer og generiske referanser.
                </p>
              </div>
            </div>
            <LangGate compact />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/app" className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700">
              <span className="lang lang-en">Open the app</span>
              <span className="lang lang-no">Åpne appen</span>
            </Link>
            <Link href="/privacy" className="px-5 py-3 rounded-xl bg-white border text-gray-900 font-medium hover:bg-gray-50">
              <span className="lang lang-en">Privacy</span>
              <span className="lang lang-no">Personvern</span>
            </Link>
            <Link href="/about" className="px-5 py-3 rounded-xl bg-white border text-gray-900 font-medium hover:bg-gray-50">
              <span className="lang lang-en">About</span>
              <span className="lang lang-no">Om</span>
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="p-5 rounded-xl border bg-white">
            <div className="font-semibold lang lang-en">What you get</div>
            <div className="font-semibold lang lang-no">Dette får du</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li className="lang lang-en">Copy buttons for KID / account / IBAN / amount / due date</li>
              <li className="lang lang-no">Kopier KID / konto / IBAN / beløp / forfall</li>
              <li className="lang lang-en">Auto presets: Norway / IBAN / Generic</li>
              <li className="lang lang-no">Automatisk preset: Norge / IBAN / Generisk</li>
              <li className="lang lang-en">Free fallback OCR in-browser</li>
              <li className="lang lang-no">Gratis OCR i nettleseren som fallback</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border bg-white">
            <div className="font-semibold lang lang-en">Privacy-first</div>
            <div className="font-semibold lang lang-no">Personvern først</div>
            <p className="mt-2 text-sm text-gray-700 lang lang-en">
              MVP focus: no accounts, no dashboards. Free OCR runs locally in your browser.
            </p>
            <p className="mt-2 text-sm text-gray-700 lang lang-no">
              MVP: ingen konto, ingen dashboard. Gratis OCR kjører lokalt i nettleseren.
            </p>
          </div>
        </section>

        <footer className="mt-12 text-xs text-gray-500">
          <p className="lang lang-en">Tip: On mobile, the file picker opens the camera directly.</p>
          <p className="lang lang-no">Tips: På mobil åpner filvelgeren ofte kamera direkte.</p>
        </footer>
      </div>
    </main>
  );
}
