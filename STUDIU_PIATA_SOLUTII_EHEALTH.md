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
**Epic Systems** este unul dintre cei mai mari furnizori de software EHR din lume, dominant pe **piața din SUA** (peste 60% din spitale; mii de spitale și clinici) și folosit și **internațional**. Oferă peste **40 de module** integrate, grupate în fluxuri clinice, operaționale și financiare. Este orientat spre **organizații mari** (sisteme de sănătate, spitale, rețele ambulatorii).

### Funcționalități existente (module și capabilități)

#### Programări și acces (Access & Revenue Cycle)
- **Appointment Scheduling** – programări integrate în EHR: autoprogramare online (cu sau fără cont MyChart), decizie asistată (secvențiere, nevoi clinice, preferințe pacient), programări centralizate pe organizație.
- Programări **specializate**: infuzii, reabilitare, proceduri, imagistică, stomatologie.
- **Notificări automate** când devin disponibile programări mai devreme; verificare electronică asigurări.
- **Revenue cycle**: înregistrare, facturare, gestionare cereri (claims), estimări de preț, opțiuni de plată pentru pacient.

#### Portal pacient – MyChart
- **Programări**: rezervare și modificare programări, check-in digital, notificări pentru programări mai devreme.
- **Fișă medicală**: acces la rezultate analize, planuri de îngrijire, informații de sănătate.
- **Comunicare**: canale multiple de comunicare cu furnizorii.
- **MyChart Central**: un singur cont (Epic ID) pentru mai multe organizații.
- **MyChart Bedside**: pentru pacienți internați – acces la informații și plan de îngrijire la pat, în timp real.
- **Monitorizare la distanță**: integrare wearables și dispozitive.
- **Instrumente financiare**: plăți online, cereri de asistență financiară.
- **Share Everywhere**: partajare fișă medicală cu orice furnizor (inclusiv non-Epic), prin link unic.
- **Asistent AI (Emmie)**: asistent virtual pentru programări, facturare și întrebări despre îngrijire.

#### Documentație clinică – ambulatoriu și spital
- **EpicCare Ambulatory**: documentație vizite ambulatorii, e-prescribing, vizualizare rezultate; **SmartTools** (SmartPhrases, SmartTexts) pentru documentare rapidă.
- **EpicCare Inpatient (ClinDoc)**: documentație spital – evaluări, note de evoluție, administrare medicamente, plan externare; charting mobil prin **Rover**.
- **Hospital Medicine**: fișă unică pacient cu pathway-uri clinice și documentare asistată de AI.

#### Urgențe și flux pacienți
- **ASAP (Emergency Department)**: modul dedicat urgențe: **track board în timp real**, workflow-uri de **triaj**, documentare cu timestamp, alerte pentru stări critice; integrare cu seturi de ordine și best practice advisories; tranziții ED → internare.
- **Patient Flow**: gestionare flux pacienți, camere, paturi, transporturi.

#### Chirurgie, anestezie, obstetrică
- **OpTime**: programări operații, documentare cazuri, date perioperatorii.
- **Anesthesia**: documentare anestezie.
- **Stork**: obstetrică – documentare prenatală, naștere, postpartum; integrare monitorizare fetală.

#### Laborator, farmacie, imagistică
- **Beaker**: sistem informatic laborator – urmărire probe, control calitate, livrare automată a rezultatelor în workflow-ul clinicianului.
- **Willow Pharmacy**: gestionare medicamente – comunicare, inventar, comenzi, verificare, preparare, dispensare, administrare; suport decizie integrat.
- **Radiant**: sistem informatic radiologie – programări, urmărire imagini, distribuire rezultate, integrare cu sisteme de diagnostic imagistic.

#### Specialități
- **Beacon**: oncologie – protocoale chimioterapie, dozaje.
- **Cupid**: cardiologie – diagnostice și proceduri.
- Alte aplicații pentru nursing, case management, îngrijiri aliate.

#### Mobil și device-uri
- **Rover**: aplicație mobilă pentru personal – documentare la pat, colectare probe, administrare medicamente, teste point-of-care, comenzi, semnături electronice, captare imagini clinice; pentru transporturi – actualizare locație pacient în timp real.

### Puncte de diferențiere față de CarePulse
- Epic acoperă **întreaga organizație** (spital, ambulatoriu, laborator, farmacie, imagistică, urgențe, chirurgie) și **revenue cycle**; oferta este modulară dar la scară enterprise.
- **ASAP** oferă triaj și track board pentru urgențe, dar nu este evidențiat un workflow tip „state machine” cu consimțământ, plan de îngrijire și dispecerat ambulanțe ca în CarePulse.
- **MyChart** este un portal pacient foarte dezvoltat (multi-organizație, Bedside, AI); în proiectul tău portalul acoperă profil, programări, istoric, analize, notificări, într-un singur context.
- **Scalare și cost** – Epic este o investiție mare; platforma ta poate fi poziționată pentru **contexturi mici/medii** sau **prototipare/cercetare**.

---

## 3. Oracle Health, fosta Cerner (global)

### Prezentare generală
**Oracle Health** (fost **Cerner**) este o platformă **EHR și de management spital** de tip **cloud**, parte din ecosistemul **Oracle**. Este folosită în **SUA** (inclusiv Veterans Health Administration), **UK** (NHS), **Australia**, **Middle East** și alte regiuni – deci **globală**. Rulare pe **Oracle Cloud Infrastructure (OCI)**; conformă cu certificări (ex. ONC în SUA). Oferă EHR unificat, **Patient Administration**, **portal pacient** (HealtheLife), **revenue cycle** și module pe specialități, cu accent pe **AI** și **automatizare**.

### Funcționalități existente (module și capabilități)

#### EHR și AI (Clinical Suite)
- **Foundation EHR**: vedere enterprise asupra informațiilor clinice; workflow-uri referințe, coordonare îngrijiri, **clinical decision support**.
- **Clinical AI Agent**: soluție **voice-enabled** pentru charting, documentare, gestionare medicamente și comenzi; funcționează pe mai multe dispozitive.
- **AI încorporate**: automatizare task-uri, reducere intrări repetitive; **rezumate generate de AI** pentru documentare.
- **Workflow-uri personalizate**: conținut și acțiuni adaptate la comportamentul și preferințele fiecărui clinician.
- **Clinical intelligence**: suport decizie în timp real, acces la studii peer-reviewed la cerere.
- **Patient timelines**: acces organizat la informațiile pacientului.

#### Comunicare și mobil
- **Care Team Messaging**: mesagerie securizată (HIPAA), inclusiv voce, text și **video conferințe** între membrii echipei.
- **EHR Nursing Mobility**: integrare cu sisteme nurse call și dispozitive medicale; administrare medicamente, colectare probe la pat.

#### Patient Administration (programări și acces)
- **Autoprogramare** și **auto-înregistrare** pentru pacienți; **check-in** self-service.
- **Workflow-uri ghidate** și automatizare pentru programări și înmatriculare.
- Interfață **responsive** (desktop și mobil).
- **Vizibilitate în timp real** asupra disponibilității, fluxului pacienților și utilizării resurselor.
- **Notificări** legate de programări (confirmări, amintiri).

#### Portal pacient (Oracle Health Patient Portal – HealtheLife)
- **Programări**: rezervare programări noi și existente (self-service); programări **return visit** pentru pacienți cu furnizor stabilit; **reschedule** și **anulare** (cu motiv); dashboard programări viitoare și trecute; posibilitate „favorite” și re-rezervare pentru programări favorite.
- **Mesagerie**: **mesagerie securizată** cu furnizori/echipe; cereri **refill/renewal** pentru rețete prin mesagerie; **proxy** – reprezentanți autorizați pot trimite mesaje în numele membrilor familiei.
- **Fișă medicală**: vizualizare, descărcare și partajare date de sănătate (alergii, rezultate analize, semne vitale, vaccinări).
- **Medicamente**: listă medicamente; cereri refill și renewal.
- **Facturare**: vizualizare solduri; **plată facturi** online.
- **Patient diary**: jurnal de sănătate (note zilnice) pentru furnizori.
- **Profil**: actualizare date personale, asigurări, contacte de urgență.
- **Preregistrare**: completare documente pre-vizită online.
- **Unified Consumer Communications**: SMS și mesagerie portal pentru coordonare programări.

#### Video și îngrijire la distanță
- **Video Visits**: vizite programate sau **on-demand** (televizită).

#### Farmacie
- **Inpatient Pharmacy**: gestionare medicamente pentru pacienți internați, automatizare.
- **Outpatient Pharmacy**: tranziții îngrijire, dispensare.
- **Pharmacy Inventory Management**: gestiune stoc.
- **Enhanced Medication Dispensing**: dispensare îmbunătățită.
- **Multum Drug Database**: monitorizare interacțiuni medicamentoase.

#### Laborator
- **Laboratory Sequence**, **Laboratory Outreach** – fluxuri laborator și outreach.

#### Urgențe (Emergency Medicine)
- **Emergency Medicine**: documentare urgențe, **tracking pacienți**; **charge capture** (facilitate, profesional E/M, infuzii/injecții); **dashboard-uri operaționale** și raportare; **documentare trauma**.

#### Perioperator
- **Perioperative management**: gestionare perioada operatorie.
- **Perioperative Inventory Management**: inventar materiale.
- **Anesthesia**: modul anestezie.

#### Revenue cycle și operațiuni
- **Case management**, **tranziții de îngrijire**, **health information management**.
- **Patient accounting**: reguli de asigurare incorporate, fluxuri de facturare automate.
- **Gestionare contracte** pentru **value-based care**.

#### Dispozitive și integritate
- **Device connectivity**: integrare dispozitive medicale; programe de validare dispozitive medicale.
- **Remote patient monitoring** și **virtual care**.

### Puncte de diferențiere față de CarePulse
- Oracle Health este **enterprise / la scară națională** (spitale, rețele, proiecte guvernamentale); nu este orientat spre cabinete mici sau prototipuri.
- **AI și voice** sunt puncte forte; în proiectul tău accentul este pe **fluxuri explicite** (urgențe, triaj, medici de gardă, ambulanțe, ATI) și pe **documente PDF** generate din EMR.
- **Emergency Medicine** acoperă documentare și tracking în urgențe; nu sunt puse în evidență în materialele publice un **workflow tip state machine** (triaj → consimțământ → plan îngrijire → externare), **dispecerat ambulanțe** sau **gestionare explicită camere ATI** ca în CarePulse.
- **Deployment** – cloud OCI, enterprise; CarePulse poate fi poziționat ca soluție **ușor de implementat** (ex. Next.js, SQLite) pentru mediu academic sau unități mici.

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
