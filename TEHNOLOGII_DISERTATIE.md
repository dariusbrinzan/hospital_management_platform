# Tehnologii utilizate în proiect – Material pentru disertație

*Acest document structurează tehnologiile folosite în platforma CarePulse, pentru integrare în capitolul „Tehnologii” / „Stack tehnologic” al lucrării de disertație.*

---

## 1. Arhitectura generală

Aplicația este o **aplicație web full-stack** cu frontend și backend în același proiect (**monolit**), folosind **Next.js** în mod **App Router**. Logica de business rulează pe server (API routes, Server Actions); baza de date este accesată exclusiv din backend. Autentificarea combină sesiuni bazate pe cookie-uri (pacienți) și coduri de acces (medici), cu date persistate în baza de date locală.

---

## 2. Framework și limbaje

### 2.1. Next.js 14
- **Rol**: framework React pentru aplicație full-stack (rendering pe server, rute, API).
- **De ce**: App Router pentru rute bazate pe fișiere, Server Components și Server Actions pentru logică pe server fără API REST explicit pentru multe operațiuni; API Routes pentru endpoint-uri (ex. cron, webhook-uri, PDF). Suport nativ TypeScript și optimizări (bundling, code splitting).
- **În proiect**: pagini în `app/` (layout-uri pentru pacient, doctor, admin), Server Actions în `lib/actions/`, API routes în `app/api/`.

### 2.2. React 18
- **Rol**: bibliotecă UI pentru interfața utilizator.
- **În proiect**: componente în `components/` și în `app/`, hooks pentru formular și stare, Context pentru temă (dark/light).

### 2.3. TypeScript 5
- **Rol**: limbaj de programare cu tipuri statice peste JavaScript.
- **De ce**: tipuri pentru modele (pacient, programare, fișă medicală, urgențe etc.), validare la compilare, autocompletare și refactorizare mai sigure. Interfețe și tipuri în `types/` și inline în componente/actions.
- **În proiect**: tot codul sursă este TypeScript (`.ts`, `.tsx`).

---

## 3. Baza de date și persistare

### 3.1. SQLite cu better-sqlite3
- **Rol**: baza de date relațională principală; toate datele aplicației (utilizatori, pacienți, programări, fișe medicale, urgențe, medici de gardă, ambulanțe, ATI, spitalizări, documente, notificări etc.) sunt stocate aici.
- **De ce**: fără server DB separat, un singur fișier (`data/carepulse.db`), potrivit pentru deployment simplu și pentru mediu academic/demonstrație. **better-sqlite3** este driver sincron, rapid, folosit doar pe server.
- **În proiect**: `lib/db.ts` – inițializare conexiune, migrări (ALTER TABLE) pentru schema în evoluție; `lib/db-helpers.ts` – funcții de acces la date (CRUD pe tabele). Next.js este configurat ca `better-sqlite3` să fie exclus din bundle-ul client (`serverExternalPackages`, `externals`).
- **Schema**: tabele pentru users, patients, appointments, notifications, emergency_cases, doctors_on_duty, medical_records, diagnoses, prescriptions, vital_signs, lab_results, procedures, imaging, ambulances, icu_*, hospital_*, medications, documente etc., cu chei străine activate (`PRAGMA foreign_keys = ON`).

---

## 4. Interfață utilizator (UI) și styling

### 4.1. Tailwind CSS 3
- **Rol**: framework CSS utility-first pentru stilizare (spacing, culori, responsive, dark mode).
- **De ce**: design rapid, consistență vizuală, clase în componentă fără fișiere CSS separate; suport **dark mode** prin clasa `class` (`tailwind.config.ts` – `darkMode: ["class"]`).
- **În proiect**: `tailwind.config.ts` – culori custom (verde/turcoaz, roșu, gri pentru dark), fonturi, background-uri pentru programări, animații (accordion, caret). Conținutul scanat în `pages/`, `components/`, `app/`.

### 4.2. Radix UI (prin shadcn/ui)
- **Rol**: componente UI accesibile și ne-stilizate (primitives): dialog, dropdown, select, checkbox, alert dialog, popover, separator etc.
- **În proiect**: dependențe `@radix-ui/react-*`; componente în `components/ui/` (butoane, input, form, dialog, table, select etc.) stilizate cu Tailwind. Asigură accesibilitate (ARIA, keyboard) fără a impune un design system propriu.

### 4.3. Lucide React
- **Rol**: bibliotecă de icoane (SVG) pentru acțiuni și navigare.
- **În proiect**: icoane în bare laterale, butoane, tabele, formulare.

### 4.4. Utilitare CSS / clase
- **clsx** + **tailwind-merge**: construire clase condiționale fără conflicte (ex. `cn()` în `lib/utils.ts`).
- **class-variance-authority (cva)**: variante de componente (ex. buton – primary, secondary, destructive).
- **tailwindcss-animate**: animații predefinite (accordion, fade etc.).

---

## 5. Formulare și validare

### 5.1. React Hook Form 7
- **Rol**: gestionare state formulare (câmpuri, erori, submit) cu re-render-uri minime.
- **În proiect**: formulare lungi (înregistrare pacient, programare, consultație, triaj, plan îngrijire, tratamente etc.) cu validare și trimitere către Server Actions sau API.

### 5.2. Zod 3
- **Rol**: validare scheme (tipuri + reguli) partajate între client și server.
- **De ce**: o singură sursă de adevăr pentru forma datelor; integrare cu React Hook Form prin rezolvers.
- **În proiect**: `lib/validation.ts` – scheme pentru pacienți, programări, câmpuri medicale; folosit în `@hookform/resolvers` pentru validare la submit și în API pentru validare input.

### 5.3. @hookform/resolvers
- **Rol**: leagă Zod (sau alte librării) de React Hook Form (resolver zod).
- **În proiect**: rezolvers în formulare pentru a transforma erorile Zod în erori de câmp pentru React Hook Form.

---

## 6. Generare documente (PDF)

### 6.1. jsPDF 2 + jspdf-autotable
- **Rol**: generare PDF-uri din browser/server: raport consultație (SOAP, diagnosticuri, rețete, semne vitale, analize, proceduri), raport analize medicale (layout profesional, intervale de referință, flag-uri H/L).
- **În proiect**: `lib/pdf-generator.ts` – funcții `generateConsultationPDF`, `generateAnalysisPDF`, eventuale altele pentru istoric medical complet; export ca Buffer pentru răspuns API (`app/api/pdf/...`). Tabele formatate cu jspdf-autotable.

### 6.2. pdfmake
- **Rol**: alternativă/ suplimentară pentru PDF-uri cu document definition (JSON); poate fi folosită pentru rapoarte sau documente cu layout declarativ.
- **În proiect**: dependență prezentă; poate fi utilizată pentru anumite rapoarte sau scrisori (verifică în cod unde se apelează).

---

## 7. Comunicare și notificări

### 7.1. Twilio
- **Rol**: trimitere SMS (ex. confirmări programări, amintiri).
- **În proiect**: API Twilio apelat din API routes (ex. cron pentru reminder-uri programări); configurare prin variabile de mediu (cont, token).

---

## 8. Grafice și vizualizare date

### 8.1. Recharts 3
- **Rol**: grafice interactive (linii, bare, pie) pentru dashboard-uri și rapoarte.
- **În proiect**: grafice în zone admin/doctor (ex. statistici programări, urgențe, ocupare).

---

## 9. Hărți

### 9.1. Leaflet + react-leaflet
- **Rol**: hărți interactive (ex. locație spital, puncte de interes, rute ambulanțe).
- **În proiect**: componente care afișează harta; tipuri `@types/leaflet` în devDependencies.

---

## 10. Autentificare și sesiuni

- **Mecanism**: sesiuni bazate pe **cookie-uri** (Next.js `cookies()`); identificare utilizator și rol (pacient / doctor / admin) cu date stocate în SQLite (users, doctor_access_codes etc.).
- **bcryptjs**: hash pentru parole sau coduri sensibile (dacă sunt stocate); folosit pentru verificare securizată.
- **În proiect**: `lib/actions/auth.actions.ts` – getCurrentSession, getDoctorSession, getAdminSession, requireAuth; login medici prin coduri de 4 cifre (doctor_access_codes). Tipuri/denumiri „Appwrite” în `types/appwrite.types.ts` pot fi legacy sau pentru compatibilitate cu un serviciu extern (autentificare pacienți); verifică în proiect dacă există client Appwrite efectiv sau doar structuri de date.

---

## 11. Tabele și date complexe în UI

### 11.1. TanStack React Table 8
- **Rol**: tabele cu sortare, filtrare, paginare pentru liste (programări, pacienți, urgențe, medici, documente etc.).
- **În proiect**: componente de tip „data table” în `components/` (ex. coloane definite în `components/table/columns.tsx`).

---

## 12. Alte biblioteci UI și UX

- **sonner**: notificări toast (succes, eroare) după acțiuni.
- **cmdk**: paletă de comenzi (Command) pentru navigare rapidă sau acțiuni.
- **react-datepicker**: selector dată în formulare.
- **react-phone-number-input**: câmp telefon cu formatare țară.
- **input-otp**: câmp pentru cod OTP (ex. cod 4 cifre medici).
- **react-dropzone**: upload fișiere (documente, imagini).
- **next-themes**: comutare temă dark/light persistentă.

---

## 13. Import/export date

### 13.1. xlsx
- **Rol**: citire/scriere fișiere Excel (.xlsx) pentru import rezultate analize sau export rapoarte.
- **În proiect**: folosit în `lib/actions/lab-import.actions.ts` sau API de import; export CSV/Excel pentru rapoarte admin.

---

## 14. Monitorizare și erori

### 14.1. Sentry (Next.js)
- **Rol**: captare erori și excepții (client și server), raportare către Sentry pentru debugging și monitorizare.
- **În proiect**: `next.config.mjs` – integrare `withSentryConfig`; `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`. Source maps încărcate pentru stack trace-uri clare; opțional tunnel pentru a evita blocarea de ad-blockere.

---

## 15. Calitate cod și formatare

- **ESLint**: linting (config Next.js, Prettier, import, Tailwind).
- **Prettier**: formatare automată cod.
- **eslint-config-next**, **eslint-config-prettier**, **eslint-config-standard**, **eslint-plugin-import**, **eslint-plugin-tailwindcss**: configurări pentru consistență și best practices.

---

## 16. Cum să prezinți în disertație

### 16.1. Structură sugerată pentru capitol
1. **Alegerea stack-ului** – de ce full-stack în un singur proiect (Next.js), de ce TypeScript, de ce SQLite pentru contextul aplicației (demonstrație, ușurință deployment).
2. **Arhitectura aplicației** – client (React, Tailwind, componente), server (Next.js API + Server Actions), baza de date (SQLite, schema principală), servicii externe (Twilio, Sentry).
3. **Tehnologii pe domenii**:
   - Frontend: React, Next.js App Router, Tailwind, Radix/shadcn, formulare (RHF + Zod), tabele (TanStack Table), grafice (Recharts), hărți (Leaflet).
   - Backend: Next.js API Routes și Server Actions, better-sqlite3, migrări și db-helpers.
   - Documente: jsPDF, jspdf-autotable (PDF consultații și analize).
   - Comunicare: Twilio (SMS).
   - Calitate: TypeScript, ESLint, Prettier; Sentry pentru monitorizare.
4. **Justificări** – pentru fiecare tehnologie majoră: problemă rezolvată (ex. PDF pentru rapoarte conforme practicilor medicale), beneficii (productivitate, mentenabilitate, securitate), eventuale limitări (ex. SQLite pentru un singur server, nu cluster).

### 16.2. Tabel rezumativ (exemplu)

| Categorie        | Tehnologie        | Versiune (ex.) | Rol în proiect                    |
|------------------|-------------------|----------------|-----------------------------------|
| Framework        | Next.js           | 14             | Full-stack, App Router, API, SSR  |
| UI               | React             | 18             | Componente, hooks                 |
| Limbaj           | TypeScript        | 5              | Tipuri, validare la compilare     |
| Baza de date     | SQLite (better-sqlite3) | 11        | Persistare date aplicație         |
| Styling          | Tailwind CSS      | 3              | UI, responsive, dark mode         |
| Componente UI    | Radix UI / shadcn | —              | Dialog, form, table, select        |
| Formulare        | React Hook Form   | 7              | State formulare                   |
| Validare         | Zod               | 3              | Scheme, client + server           |
| PDF              | jsPDF + autotable | 2 / 5          | Rapoarte consultații, analize    |
| Comunicare       | Twilio            | 5              | SMS notificări                    |
| Grafice          | Recharts          | 3              | Dashboard-uri, rapoarte           |
| Hărți            | Leaflet, react-leaflet | 1 / 4   | Locații, rute                    |
| Monitorizare     | Sentry            | 8 (Next.js)    | Erori, performance               |

### 16.3. Diagramă simplă (text)
Poți include o diagramă bloc: **Browser** (React, Tailwind, RHF, Zod) ↔ **Next.js Server** (API Routes, Server Actions) ↔ **SQLite** (better-sqlite3); **Next.js** ↔ **Twilio** (SMS), **Sentry** (erori). Opțional: servicii externe pentru autentificare (dacă folosești Appwrite sau altceva).

---

*Document generat pe baza `package.json`, `next.config.mjs`, `tailwind.config.ts` și a structurii proiectului. Verifică în cod dacă Appwrite este folosit efectiv pentru auth sau doar pentru tipuri; adaptează secțiunea de autentificare în funcție de implementarea reală.*
