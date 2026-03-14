import Link from 'next/link';

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
          <h1 className="text-4xl font-semibold tracking-tight">Invoice OCR</h1>
          <p className="mt-3 text-lg text-gray-700">
            Super simple: take a photo / upload → copy payment fields.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Supports Norway-style invoices (KID + 11-digit account), IBAN invoices, and generic references.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/app"
              className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700"
            >
              Open the app
            </Link>
            <Link
              href="/privacy"
              className="px-5 py-3 rounded-xl bg-white border text-gray-900 font-medium hover:bg-gray-50"
            >
              Privacy
            </Link>
            <Link
              href="/about"
              className="px-5 py-3 rounded-xl bg-white border text-gray-900 font-medium hover:bg-gray-50"
            >
              About
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="p-5 rounded-xl border bg-white">
            <div className="font-semibold">What you get</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>Copy buttons for KID / account / IBAN / amount / due date</li>
              <li>Auto presets: Norway / IBAN / Generic</li>
              <li>Free fallback OCR in-browser</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border bg-white">
            <div className="font-semibold">Privacy-first</div>
            <p className="mt-2 text-sm text-gray-700">
              MVP focus: no accounts, no dashboards. AI mode processes the image via a third-party model provider.
              Free OCR mode runs locally in your browser.
            </p>
          </div>
        </section>

        <footer className="mt-12 text-xs text-gray-500">
          <p>Tip: On mobile, the file picker opens the camera directly.</p>
        </footer>
      </div>
    </main>
  );
}
