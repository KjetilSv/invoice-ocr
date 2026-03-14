export const metadata = {
  title: 'Privacy — Invoice OCR',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold">Privacy</h1>

      <p className="mt-3 text-gray-700">
        Kortversjon: vi prøver å holde dette <b>privacy-first</b>. Denne siden forklarer hva som skjer med data når du
        scanner en faktura.
      </p>

      <h2 className="mt-6 text-xl font-semibold">Hva vi lagrer</h2>
      <ul className="mt-2 list-disc pl-6 text-gray-700 space-y-1">
        <li>
          <b>Vi lagrer ikke</b> fakturabilder permanent på server i denne MVP-en.
        </li>
        <li>
          Vi lagrer en enkel <b>dagskvote</b> i browseren din (localStorage): antall gratis/bonus scans igjen i dag, og om
          du har brukt "I donated" i dag.
        </li>
      </ul>

      <h2 className="mt-6 text-xl font-semibold">Når du bruker “Run (AI)”</h2>
      <p className="mt-2 text-gray-700">
        Bildet sendes til en AI-modell via <b>OpenRouter</b> for å trekke ut betalingsfelter. Det betyr at bildet
        behandles av en tredjepartstjeneste for å produsere svaret.
      </p>
      <p className="mt-2 text-gray-700">
        Hvis du ikke ønsker å sende fakturaen til en ekstern tjeneste, bruk <b>Run (free OCR)</b> i stedet.
      </p>

      <h2 className="mt-6 text-xl font-semibold">Når du bruker “Run (free OCR)”</h2>
      <p className="mt-2 text-gray-700">
        OCR kjøres i nettleseren din med <code>tesseract.js</code>. Bildet sendes ikke til server for OCR.
      </p>

      <h2 className="mt-6 text-xl font-semibold">Sikkerhet</h2>
      <ul className="mt-2 list-disc pl-6 text-gray-700 space-y-1">
        <li>Unngå å laste opp dokumenter du ikke har lov til å dele.</li>
        <li>Ikke bruk appen til sensitive dokumenter hvis du ikke er komfortabel med tredjeparts AI-prosessering.</li>
      </ul>

      <h2 className="mt-6 text-xl font-semibold">Endringer</h2>
      <p className="mt-2 text-gray-700">
        Denne policyen kan endres når vi går fra MVP til en mer “ordentlig” betalings- og logging-løsning.
      </p>

      <p className="mt-8 text-sm text-gray-500">
        <a className="underline" href="/">← Tilbake</a>
      </p>
    </main>
  );
}
