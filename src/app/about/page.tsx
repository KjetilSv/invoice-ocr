import Link from 'next/link';
import LangGate from '@/components/LangGate';

export const metadata = {
  title: 'About — Invoice OCR',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">About</h1>
            <p className="mt-1 text-sm text-gray-600 lang lang-en">What this tool is and how it works.</p>
            <p className="mt-1 text-sm text-gray-600 lang lang-no">Hva dette verktøyet er og hvordan det funker.</p>
          </div>
          <LangGate compact />
        </div>

        <div className="mt-6 p-5 rounded-xl border bg-white shadow-sm">
          <div className="lang lang-en">
            <p className="text-gray-700">
              <b>Invoice OCR</b> is a tiny tool that extracts payment details from an invoice image/PDF so you can copy
              KID/account/IBAN quickly.
            </p>
            <h2 className="mt-6 text-lg font-semibold">How it works</h2>
            <ul className="mt-2 list-disc pl-6 text-gray-700 space-y-1">
              <li>
                <b>Run</b> uses either free in-browser OCR or your Local API (depending on your admin settings).
              </li>
              <li>
                Optional AI mode can be enabled in <code>/admin</code>.
              </li>
              <li>
                The UI shows confidence for key fields when available.
              </li>
            </ul>
          </div>

          <div className="lang lang-no">
            <p className="text-gray-700">
              <b>Invoice OCR</b> er et lite verktøy som henter ut betalingsdetaljer fra faktura (bilde/PDF) slik at du kan
              kopiere KID/konto/IBAN raskt.
            </p>
            <h2 className="mt-6 text-lg font-semibold">Hvordan det funker</h2>
            <ul className="mt-2 list-disc pl-6 text-gray-700 space-y-1">
              <li>
                <b>Kjør</b> bruker enten gratis OCR i nettleseren eller Local API (avhengig av innstillingene dine).
              </li>
              <li>
                Valgfri AI-modus kan skrus på i <code>/admin</code>.
              </li>
              <li>
                UI viser confidence for nøkkelfelter når det finnes.
              </li>
            </ul>
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
