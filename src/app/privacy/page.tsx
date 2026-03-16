import Link from 'next/link';
import LangGate from '@/components/LangGate';

export const metadata = {
  title: 'Privacy — Invoice OCR',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Privacy</h1>
            <p className="mt-1 text-sm text-gray-600 lang lang-en">How invoice data is handled.</p>
            <p className="mt-1 text-sm text-gray-600 lang lang-no">Hvordan fakturadata behandles.</p>
          </div>
          <LangGate compact />
        </div>

        <div className="mt-6 p-5 rounded-xl border bg-white shadow-sm">
          <div className="lang lang-en">
            <p className="text-gray-700">
              Short version: we try to keep this <b>privacy-first</b>. The free OCR mode runs locally in your browser.
            </p>

            <h2 className="mt-6 text-lg font-semibold">What we store</h2>
            <ul className="mt-2 list-disc pl-6 text-gray-700 space-y-1">
              <li>We do not store your invoice files permanently on the server (MVP).</li>
              <li>
                We store simple settings in your browser (localStorage), like language and admin preferences.
              </li>
            </ul>

            <h2 className="mt-6 text-lg font-semibold">AI mode</h2>
            <p className="mt-2 text-gray-700">
              If you enable AI mode, images may be sent to a third-party model provider. Keep it off if you prefer
              everything to stay local.
            </p>
          </div>

          <div className="lang lang-no">
            <p className="text-gray-700">
              Kortversjon: vi prøver å holde dette <b>privacy-first</b>. Gratis OCR kjører lokalt i nettleseren.
            </p>

            <h2 className="mt-6 text-lg font-semibold">Hva vi lagrer</h2>
            <ul className="mt-2 list-disc pl-6 text-gray-700 space-y-1">
              <li>Vi lagrer ikke fakturafiler permanent på server (MVP).</li>
              <li>
                Vi lagrer noen enkle innstillinger i nettleseren (localStorage), f.eks. språk og admin-innstillinger.
              </li>
            </ul>

            <h2 className="mt-6 text-lg font-semibold">AI-modus</h2>
            <p className="mt-2 text-gray-700">
              Hvis du aktiverer AI-modus kan bilder sendes til en tredjeparts modell-provider. Hold den av hvis du vil at
              alt skal være lokalt.
            </p>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500 flex gap-3">
          <Link className="underline" href="/">
            ← Home
          </Link>
          <Link className="underline" href="/app">
            Open app
          </Link>
        </div>
      </div>
    </main>
  );
}
