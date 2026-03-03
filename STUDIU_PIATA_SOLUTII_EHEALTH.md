# Studiu de piață – Soluții eHealth existente (perspectivă globală)

*Document pentru disertație – comparație cu funcționalitățile implementate în platforma CarePulse (programări, EMR, primiri urgente, portal pacient, medici de gardă, ambulanțe, ATI, spitalizări, documente PDF, notificări). Studiu cu **două soluții globale** (SUA / internațional) și **o soluție din România**.*

---

## 1. InteroCloud (România / Europa)

### Prezentare generală
**InteroCloud** este o platformă cloud de practice management pentru cabinete medicale și clinici, utilizată în **România și în Europa** la cabinete individuale, clinici multidisciplinare, centre de reabilitare și centre de fizioterapie. Este orientată în special pe **gestionarea zilnică a cabinetului** și pe reducerea volumului administrativ. Reprezintă **soluția din piața locală** inclusă în acest studiu.

### Particularități și funcționalități

- **Programări (scheduling)**  
  Calendar cu vizualizare pe zi, săptămână sau lună; filtrare după specializare, doctor sau resurse. Suportă **programări recurente** și **drag-and-drop**. Nu există (în descrierile publice) un mod explicit de triaj sau workflow pentru urgențe; focusul este pe programări planificate.

- **Fișe medicale electronice (EHR)**  
  Date centralizate: istoric medical, tratamente, istoric programări, starea plăților, alerte medicale. EHR este integrat cu calendarul de programări. **Șabloane medicale personalizabile** fără cunoștințe tehnice: formulare de anamneză, consultație, scrisori medicale, proceduri, evaluări clinice.

- **Comunicare și notificări**  
  **Reminder-uri SMS automate** pentru reducerea ratei de neprezentare (no-show). Nu se menționează explicit notificări pentru rezultate de analize sau mesagerie pacient–medic în același mod ca în platforme cu portal pacient dedicat.

- **Documente și conformitate**  
  **Semnătură electronică** pentru consimțământuri și documente medicale. Export rapoarte și statistici în **PDF/Excel**. Posibil integrare cu casa de marcat.

- **Plăți și comisioane**  
  Gestionare plăți și **urmărire comisioane pe doctor**. Pachete și abonamente pentru servicii recurente (ex. fizioterapie, control periodic).

- **Deployment și suport**  
  Soluție **SaaS (cloud)**; acces din browser. Oferă suport dedicat și accent pe **usability** și reducerea timpului petrecut la task-uri administrative.

### Puncte de diferențiere față de CarePulse
- InteroCloud este axată pe **cabinete/clinici** și programări planificate, nu pe fluxuri de **urgență** (triaj, state machine, dispecerat, ambulanțe).
- Nu sunt descrise module pentru **ATI**, **spitalizări**, **stocuri de medicamente** sau **investigații imagistice**.
- Puternic orientată pe **facturare, plăți și comisioane**, în timp ce în proiectul tău acestea pot fi secundare sau inexistente.
- **Șabloane medicale configurabile** reprezintă un punct forte pentru clinici cu nevoi foarte variate de documentare.

---

## 2. Epic (SUA / global)

### Prezentare generală
**Epic Systems** este unul dintre cei mai mari furnizori de software EHR din lume, dominant pe **piața din SUA** (multe spitale și rețele de sănătate) și folosit și **internațional**. Oferă un ecosistem integrat: EHR pentru spitale și clinici, **MyChart** (portal pentru pacienți), programări, facturare și cycle de venituri. Este orientat spre **organizații mari** (sisteme de sănătate, spitale, rețele ambulatorii).

### Particularități și funcționalități

- **Programări (Appointment Scheduling)**  
  Programări **integrate** în EHR: **autoprogramare online** (cu sau fără cont MyChart), suport pentru decizii (secvențiere, nevoi clinice, preferințe pacient), **programări centralizate** pe organizație. Programări specializate: infuzii, reabilitare, proceduri, imagistică, stomatologie. **Notificări automate** când devin disponibile programări mai devreme. Rezultate concrete raportate: creșteri semnificative ale volumului de vizite și economii de costuri prin reducerea timpului personalului.

- **Portal pacient (MyChart)**  
  **MyChart** funcționează ca „ușă digitală”: găsire îngrijiri, înțelegere costuri. **MyChart Central** – un singur login (Epic ID) pentru mai multe organizații. **MyChart Bedside** – pentru pacienți internați (acces la informații și plan de îngrijire la pat). **Monitorizare la distanță** și integrare **wearables**. Instrumente financiare: plăți online, asistență financiară. **Share Everywhere** – partajare fișă medicală cu orice furnizor. **Asistent AI (Emmie)** pentru programări, facturare și management.

- **Acces și revenue cycle**  
  Gestionare referuri, **estimări de preț**, verificare asigurări electronice, înregistrare și facturare automatizate. Focus puternic pe **optimizare venituri** și eficiență operațională la scară mare.

- **Deployment și piață**  
  Implementări **on-premise** sau **cloud**, la scară enterprise. Folosit în mii de spitale și clinici; cerințe de certificare (ex. ONC în SUA) și conformitate cu reglementările locale.

### Puncte de diferențiere față de CarePulse
- Epic acoperă **întreaga organizație** (spital, ambulatoriu, laborator, imagistică) și **revenue cycle**; nu este un produs „light” pentru un singur spital sau clinică mică.
- **MyChart** este un portal pacient foarte dezvoltat (multi-organizație, Bedside, AI); în proiectul tău portalul acoperă profil, programări, istoric, analize, notificări, într-un singur context.
- Epic nu pune în prim plan (în materialele publice) **workflow dedicat de urgențe** (triaj, state machine, consimțământ, plan de îngrijire) sau **dispecerat ambulanțe**; acestea pot exista în module specializate, dar nu sunt evidențiate ca în CarePulse.
- **Scalare și cost** – Epic este o investiție mare; platforma ta poate fi poziționată pentru **contexturi mici/medii** sau **prototipare/cercetare**.

---

## 3. Oracle Health, fosta Cerner (global)

### Prezentare generală
**Oracle Health** (fost **Cerner**) este o platformă **EHR și de management spital** de tip **cloud**, parte din ecosistemul **Oracle**. Este folosită în **SUA** (inclusiv Veterans Health Administration), **UK** (NHS), **Australia**, **Middle East** și alte regiuni – deci cu adevărat **globală**. Oferă EHR unificat, **Patient Administration** (acces, programări, înregistrare), **revenue cycle** și instrumente de analiză, cu accent pe **AI** și **automatizare**.

### Particularități și funcționalități

- **EHR și AI**  
  EHR **unificat**, alimentat cu **AI încorporate**: automatizare task-uri, **comenzi vocale** și **rezumate generate de AI** pentru eficiență clinică. **Workflow-uri personalizate** care se adaptează la preferințele clinicianilor. Livrare **SaaS** pe cloud (Oracle Cloud Infrastructure – OCI) cu actualizări regulate și conformitate (ex. **ONC Certified** în SUA).

- **Patient Administration (programări și acces)**  
  **Autoprogramare** și **auto-înregistrare** pentru pacienți; **check-in** self-service. **Workflow-uri ghidate** și automatizare pentru programări și înmatriculare. Interfață **responsive** (desktop și mobil). **Vizibilitate în timp real** asupra disponibilității, fluxului pacienților și utilizării resurselor.

- **Revenue cycle și operațiuni spital**  
  Integrare **clinica + financiar**: case management, tranziții de îngrijire, health information management. **Patient accounting** cu reguli de asigurare incorporate și fluxuri de facturare automate. Gestionare contracte pentru **value-based care**.

- **Securitate și infrastructură**  
  Rulare pe **OCI** cu securitate la nivel enterprise și **scalabilitate globală**; potrivit pentru rețele de spitale și sisteme naționale de sănătate.

### Puncte de diferențiere față de CarePulse
- Oracle Health este **enterprise / la scară națională** (spitale, rețele, proiecte guvernamentale); nu este orientat spre cabinete mici sau prototipuri.
- **AI și voice** sunt puncte forte; în proiectul tău accentul este pe **fluxuri explicite** (urgențe, triaj, medici de gardă, ambulanțe, ATI) și pe **documente PDF** generate din EMR.
- **Patient Administration** acoperă programări și self-service; **nu** sunt puse în evidență în materialele publice **triaj dedicat**, **dispecerat ambulanțe** sau **gestionare camere ATI/spitalizări** în același mod ca în CarePulse.
- **Deployment** – cloud enterprise; CarePulse poate fi poziționat ca soluție **ușor de implementat** (ex. Next.js, SQLite) pentru mediu academic sau unități mici.

---

## Sinteză pentru disertație

| Aspect | InteroCloud (RO/EU) | Epic (global) | Oracle Health (global) | CarePulse (proiect) |
|--------|---------------------|---------------|------------------------|----------------------|
| **Segment** | Cabinete, clinici, reabilitare | Spitale, rețele, organizații mari | Spitale, sisteme naționale, enterprise | Portal pacient + medici + admin + urgențe + ATI/spitalizări |
| **Programări** | Da, calendar, recurente | Da, autoprogramare, centralizat, specializat | Da, self-service, workflow ghidat | Da, sloturi, doctor, specializare, pachete analize |
| **EHR/EMR** | Da, șabloane personalizabile | Da, EHR complet, MyChart | Da, EHR unificat, AI, voice | Da, consultații, diagnosticuri, rețete, semne vitale, proceduri |
| **Urgențe / triaj** | Nu (public) | Nu evidențiat (public) | Nu evidențiat (public) | Da, workflow, triaj, consimțământ, plan îngrijire |
| **Medici de gardă / rotație** | Nu | Nu (public) | Nu (public) | Da |
| **Ambulanțe / dispecerat** | Nu | Nu (public) | Nu (public) | Da |
| **ATI / spitalizări** | Nu | Da (în ecosistem spital) | Da (în ecosistem) | Da, explicit în platformă |
| **Portal pacient** | Implicit (programări) | Da, MyChart (multi-org, Bedside, AI) | Da, self-service, check-in | Da, profil, programări, istoric, analize, notificări |
| **Notificări** | SMS reminder | Da, programări mai devreme | — | Da, programări, rezultate, dropdown |
| **PDF / documente** | Export rapoarte PDF | Integrat în EHR | — | Da, PDF consultații, analize, documente medicale |
| **Plăți / facturare** | Da, comisioane | Da, revenue cycle | Da, patient accounting, value-based | Opțional / inexistent în descriere |
| **GDPR / consimțământ** | Semnătură documente | Conformitate locală (ex. US) | Conformitate locală, OCI | Consimțământ la înregistrare, documente |
| **Deployment** | Cloud (SaaS) | On-premise / cloud, enterprise | Cloud (OCI), global | Web (Next.js), SQLite, Appwrite |

Acest studiu poate fi folosit în disertație pentru a **poziționa** platforma atât față de **piața locală** (InteroCloud), cât și față de **soluții globale** (Epic, Oracle Health): soluțiile existente acoperă cabinete/clinici sau ecosisteme spital enterprise; această lucrare extinde domeniul cu **fluxuri explicite de urgență** (triaj, state machine, consimțământ, plan de îngrijire), **medici de gardă**, **dispecerat ambulanțe** și **ATI/spitalizări** într-o singură aplicație, potrivită și pentru context academic sau unități mici/medii.

---

*Surse: site-uri oficiale InteroCloud (România/Europa), Epic (epic.com), Oracle Health / Cerner (cerner.com); căutări web 2024–2025. Recomandare: verificare suplimentară și citare surselor în bibliografie.*
