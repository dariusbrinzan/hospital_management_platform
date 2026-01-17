# Documentație Proiect Disertație - Platformă eHealth

## 1. Prezentare Generală

Platforma eHealth este o aplicație web modernă pentru gestionarea serviciilor medicale, dezvoltată cu Next.js, TypeScript și SQLite. Sistemul oferă funcționalități complete pentru pacienți, medici și administratori.

## 2. Funcționalități Implementate

### 2.1. Autentificare și Înregistrare
- **Autentificare utilizatori** prin Appwrite
- **Înregistrare pacienți** cu formular complet de date medicale
- **Upload documente de identitate** (CI, pașaport)
- **Consimțământ pentru prelucrarea datelor** (GDPR)

### 2.2. Gestionare Pacienți
- **Profil complet pacient** cu:
  - Date personale (nume, email, telefon, adresă)
  - Date medicale (grupă sanguină, înălțime, greutate)
  - Istoric medical (boli cardiovasculare, cronice, intervenții chirurgicale)
  - Stil de viață (fumător, consum alcool, exerciții)
  - Alergii și medicamente curente
  - Istoric familial medical
- **Dashboard pacient** cu programări viitoare și trecute
- **Notificări** pentru programări și actualizări

### 2.3. Gestionare Programări
- **Creare programări** cu:
  - Selectare specializare medicală
  - Selectare doctor (cu metadate: vârstă, studii, experiență, specializări suplimentare)
  - Selectare pachet analize medicale
  - Selectare dată și oră
  - Motiv consultație
- **Vizualizare programări** (viitoare și trecute)
- **Anulare programări** cu motiv
- **Status programări**: pending, scheduled, cancelled

### 2.4. Gestionare Medici
- **Bază de date medici** cu:
  - Informații complete (nume, specializare, imagine)
  - Vârstă
  - Studii (grad, instituție, țară, an)
  - Experiență (ani)
  - Specializări suplimentare
  - Limbi vorbite
  - Certificări
- **Filtrare medici** după specializare
- **Vizualizare detalii doctor** în dashboard admin
- **Card informații doctor** în formulare

### 2.5. Analize Medicale
- **Pachete analize predefinite**:
  - Pachet complet (bărbați/femei)
  - Pachet de bază
  - Pachete specializate (prostată, ginecologie, cardiologie, etc.)
- **Introducere rezultate analize** de către medici
- **Intervale de referință dinamice** bazate pe:
  - Vârsta pacientului
  - Genul
  - Greutatea
- **Colorare rezultate**:
  - Verde pentru valori normale
  - Roșu pentru valori anormale
- **Grupare analize** după programare în istoric medical

### 2.6. Istoric Medical Complet (EMR - Electronic Medical Record)
- **Înregistrări medicale** cu:
  - Consultații medicale
  - Diagnosticuri (cu coduri ICD-10)
  - Rețete medicale
  - Semne vitale (tensiune, puls, temperatură, SpO2, etc.)
  - Rezultate analize
  - Proceduri medicale
- **Cronologie medicală** cu toate evenimentele sortate cronologic
- **Vizualizare detaliată** pentru fiecare consultație
- **Alergii și reacții adverse**
- **Vaccinări**
- **Istoric familial medical**

### 2.7. Primiri Urgente (Emergency Admissions)
- **Sistem de workflow** cu state machine:
  - Prezentare (Arrival)
  - Triaj (Triage)
  - Consimțământ (Consent)
  - Internare (Admission)
  - Tratament (Treatment)
  - Externare (Discharge)
- **Kanban board** pentru vizualizare cazuri
- **Niveluri de triaj**: critic, urgent, normal
- **Prioritizare automată** bazată pe triaj
- **Tranziții de stare** cu validare și documentare
- **Reguli anti-skip**: nu se poate sări peste etape fără motiv documentat
- **Documente asociate** (consimțământ, plan de îngrijire, scrisoare de externare)

### 2.8. Gestionare Medici de Gardă
- **Programare medici de gardă** pe săptămâni
- **Calcul workload** pentru fiecare doctor:
  - Număr cazuri urgente active
  - Număr programări
- **Rotație automată** bazată pe workload minim
- **Capacitate maximă** de cazuri per doctor
- **Disponibilitate medici**

### 2.9. Dashboard Administrator
- **Vizualizare toate programările**
- **Filtrare după specializare și doctor**
- **Gestionare pacienți**
- **Acces la sistemul de primiri urgente**
- **Vizualizare și editare consultații medicale**
- **Introducere rezultate analize**

### 2.10. Notificări
- **Notificări pentru programări** (confirmare, anulare, amintire)
- **Notificări pentru rezultate analize**
- **Dropdown notificări** în header
- **Marcare notificări ca citite**

## 3. Tehnologii Utilizate

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Next.js API Routes
- **Baza de date**: SQLite (better-sqlite3)
- **Autentificare**: Appwrite
- **Validare**: Zod
- **Form Management**: React Hook Form

## 4. Structura Bazei de Date

Baza de date conține următoarele tabele principale:

1. **users** - Utilizatori platformă
2. **patients** - Pacienți înregistrați
3. **appointments** - Programări medicale
4. **notifications** - Notificări utilizatori
5. **emergency_cases** - Cazuri de urgență
6. **doctors_on_duty** - Medici de gardă
7. **emergency_state_transitions** - Tranziții de stare pentru urgențe
8. **emergency_documents** - Documente asociate urgențelor
9. **medical_records** - Înregistrări medicale
10. **diagnoses** - Diagnosticuri
11. **prescriptions** - Rețete medicale
12. **vital_signs** - Semne vitale
13. **lab_results** - Rezultate analize
14. **procedures** - Proceduri medicale
15. **allergies_adverse_reactions** - Alergii și reacții adverse
16. **vaccinations** - Vaccinări
17. **family_history** - Istoric familial medical

## 5. Diagrame

Vezi secțiunile următoare pentru diagrame UML, ER și secvență.
