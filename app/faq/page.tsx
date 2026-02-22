import Link from "next/link";
import { LogoLink } from "@/components/LogoLink";

const FAQ_ITEMS = [
  {
    category: "Programări",
    questions: [
      {
        q: "Cum fac o programare nouă?",
        a: "După ce vă autentificați, mergeți la „Programare nouă” din meniu. Alegeți specialitatea, medicul, data și ora disponibilă, introduceți motivul vizitei și confirmați. Veți primi o confirmare și notificări despre programare.",
      },
      {
        q: "Pot anula sau reprograma o programare?",
        a: "Da. În dashboard, la programările viitoare aveți butoane pentru „Reprogramare” și „Anulare”. La anulare vi se poate cere un motiv scurt. După anulare, veți primi o confirmare.",
      },
      {
        q: "Cum văd programările mele trecute?",
        a: "În dashboard sunt afișate atât programările viitoare, cât și cele trecute. Pentru istoric complet puteți folosi și pagina „Calendar” sau „Istoric medical” (unde apar și consultațiile legate de programări).",
      },
      {
        q: "Primești un reminder înainte de programare?",
        a: "Da. În aplicație primiți notificări (de exemplu cu 24 de ore înainte). Verificați caseta de notificări (icon clopoțel) din header.",
      },
    ],
  },
  {
    category: "Mesaje cu medicul",
    questions: [
      {
        q: "Cum pot trimite un mesaj medicului?",
        a: "Mergi la „Mesaje” din meniu, alegeți programarea la care ține conversația și scrieți mesajul în caseta de text. Mesajul este legat de acea programare; medicul va primi notificare și vă poate răspunde.",
      },
      {
        q: "Când primesc răspuns la un mesaj?",
        a: "Când medicul răspunde, primiți o notificare în aplicație. Deschideți „Mesaje” și conversația pentru programarea respectivă pentru a citi răspunsul.",
      },
    ],
  },
  {
    category: "Analize și rezultate",
    questions: [
      {
        q: "Unde văd rezultatele la analize?",
        a: "După ce sunt introduse de medic/laborator, rezultatele apar în dashboard la programarea corespunzătoare (dacă programarea era pentru analize). Puteți descărca și un raport PDF pentru fiecare set de analize.",
      },
      {
        q: "Cum descarc raportul PDF al analizelor?",
        a: "În dashboard, la programarea cu rezultate de analize, folosiți butonul de descărcare PDF. Se generează un buletin de analize cu datele dumneavoastră și interpretarea trebuie făcută de medicul curant.",
      },
    ],
  },
  {
    category: "Documente și istoric medical",
    questions: [
      {
        q: "Ce documente pot încărca?",
        a: "Puteți încărca documente medicale (rezultate, imagini, scrisori de la medici etc.) din secțiunea de istoric medical / documente. Fiecare document poate avea un tip și o categorie; unele pot necesita aprobare.",
      },
      {
        q: "Cum văd istoricul medical?",
        a: "Mergi la „Istoric medical” din meniu. Acolo sunt afișate consultații, alergii, vaccinări, documente și analize. Puteți filtra după dată, tip sau doctor.",
      },
    ],
  },
  {
    category: "Cont și securitate",
    questions: [
      {
        q: "Cum îmi actualizez datele personale?",
        a: "Datele de contact și informațiile medicale de bază se actualizează din „Profil medical”. Asigurați-vă că păstrați un număr de telefon și email corecte pentru notificări.",
      },
      {
        q: "Cine are acces la datele mele?",
        a: "Datele sunt accesibile doar dumneavoastră (pacient), medicilor care vă au în programări și administratorilor sistemului, în scopul prestării serviciilor medicale și al funcționării platformei.",
      },
      {
        q: "Am uitat parola. Ce fac?",
        a: "Contactați administratorul sau suportul pentru resetarea parolei. Funcționalitatea de „Am uitat parola” poate fi activată ulterior prin email.",
      },
    ],
  },
  {
    category: "Altele",
    questions: [
      {
        q: "Cum găsesc cabinetul medicului în spital?",
        a: "Folosiți „Hartă Spital” din meniu. Puteți căuta după numele medicului sau parcurge harta pe etaje și săli; vi se afișează cabinetul și, unde e cazul, indicii de orientare.",
      },
      {
        q: "Pot lăsa o recenzie după consultație?",
        a: "Da. După programări trecute, în dashboard aveți opțiunea de a lăsa o recenzie (notă și eventual comentariu) pentru medic. Feedback-ul ajută și alți pacienți.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-800">
      <header className="border-b border-dark-200 dark:border-dark-600 sticky top-0 z-10 bg-white dark:bg-dark-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <LogoLink />
          <Link
            href="/"
            className="text-14-medium text-green-600 hover:text-green-700 dark:text-green-400"
          >
            Înapoi la autentificare
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-24-bold text-dark-900 dark:text-dark-100 mb-2">
          Întrebări frecvente
        </h1>
        <p className="text-14-regular text-dark-600 dark:text-dark-400 mb-8">
          Răspunsuri la cele mai comune întrebări despre programări, mesaje, analize și cont.
        </p>

        <div className="space-y-8">
          {FAQ_ITEMS.map((section) => (
            <section key={section.category}>
              <h2 className="text-18-semibold text-dark-800 dark:text-dark-200 mb-4">
                {section.category}
              </h2>
              <ul className="space-y-2">
                {section.questions.map((item, idx) => (
                  <li key={idx}>
                    <details className="group rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-800 overflow-hidden">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-14-semibold text-dark-800 dark:text-dark-100 hover:bg-dark-50 dark:hover:bg-dark-700 [&::-webkit-details-marker]:hidden">
                        <span>{item.q}</span>
                        <span className="text-dark-400 transition group-open:rotate-180" aria-hidden>
                          ▼
                        </span>
                      </summary>
                      <div className="border-t border-dark-200 dark:border-dark-600 px-4 py-3 text-14-regular text-dark-600 dark:text-dark-300 bg-dark-50/50 dark:bg-dark-800/80">
                        {item.a}
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-dark-200 dark:border-dark-600 bg-green-50 dark:bg-green-900/20 p-6">
          <p className="text-14-semibold text-dark-800 dark:text-dark-100 mb-2">
            Nu v-ați găsit răspunsul?
          </p>
          <p className="text-14-regular text-dark-600 dark:text-dark-400 mb-4">
            Contactați suportul sau administratorul unității pentru asistență.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-green-600 px-4 py-2 text-14-medium text-white hover:bg-green-700"
          >
            Mergi la autentificare
          </Link>
        </div>
      </main>

      <footer className="border-t border-dark-200 dark:border-dark-600 py-4 text-center text-12-regular text-dark-500">
        © 2026 eHealth.ro
      </footer>
    </div>
  );
}
