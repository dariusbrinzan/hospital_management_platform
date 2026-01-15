# Ghid de Testare - Istoric Medical Complet

## Flow de Testare Complet

### Pasul 1: Autentificare și Accesare Pagină

1. **Autentifică-te ca pacient:**
   - Deschide aplicația: `http://localhost:3000`
   - Loghează-te cu un cont de pacient existent
   - Sau creează un cont nou prin `/register`

2. **Accesează Dashboard-ul:**
   - După autentificare, vei fi redirecționat la `/patients/[userId]/dashboard`
   - În header, vei vedea link-ul **"Istoric Medical"**

3. **Accesează Istoricul Medical:**
   - Click pe **"Istoric Medical"** din header
   - Sau accesează direct: `/patients/[userId]/medical-history`

### Pasul 2: Verificare Pagină Goală

La prima accesare, ar trebui să vezi:
- ✅ Carduri de summary (toate cu 0)
- ✅ Mesaj "Nu există înregistrări medicale încă"

### Pasul 3: Adăugare Date de Test

#### Opțiunea A: Folosind API-urile direct (Recomandat pentru testare rapidă)

Poți folosi **Postman**, **Thunder Client** sau **curl** pentru a adăuga date:

#### 3.1. Obține Patient ID

Mai întâi, trebuie să obții `patientId` (nu `userId`). Poți face asta prin:

**Opțiunea 1: Folosind endpoint-ul de debug (Recomandat)**
```bash
# După ce ești autentificat, accesează:
GET http://localhost:3000/api/debug/patient-id

# Sau în browser, după autentificare:
http://localhost:3000/api/debug/patient-id
```

**Opțiunea 2: Din Dashboard**
- Accesează dashboard-ul pacientului
- Deschide Developer Tools (F12)
- În Console, rulează: `console.log(window.location.pathname)`
- Sau verifică Network tab pentru request-uri care conțin `patientId`

**Opțiunea 3: Din baza de date**
- Deschide `data/carepulse.db` cu un SQLite browser
- Rulează: `SELECT id, userId, name FROM patients WHERE userId = 'YOUR_USER_ID'`

#### 3.2. Adaugă o Consultație Medicală

```bash
POST http://localhost:3000/api/medical-records
Content-Type: application/json

{
  "patientId": "PASTE_PATIENT_ID_HERE",
  "doctorName": "Dr. Ion Popescu",
  "recordType": "consultation",
  "visitDate": "2024-01-15T10:00:00Z",
  "chiefComplaint": "Durere de cap persistentă",
  "subjectiveNotes": "Pacientul raportează dureri de cap de 3 zile, agravate dimineața",
  "objectiveFindings": "Tensiune arterială: 140/90 mmHg. Puls: 78 bpm. Temperatură: 36.5°C",
  "assessment": "Hipertensiune arterială ușoară. Dureri de cap probabil secundare hipertensiunii",
  "plan": "Monitorizare tensiune zilnică. Revenire peste 2 săptămâni. Dacă simptomele persistă, consult cardiolog"
}
```

#### 3.3. Adaugă Diagnosticuri la Consultație

După ce ai creat consultația, obții `recordId` din răspuns, apoi:

```bash
POST http://localhost:3000/api/medical-records/[RECORD_ID]/diagnoses
Content-Type: application/json

{
  "diagnosisName": "Hipertensiune arterială esențială",
  "diagnosisCode": "I10",
  "diagnosisType": "primary",
  "status": "active",
  "notes": "Hipertensiune ușoară, necesită monitorizare"
}
```

#### 3.4. Adaugă Rețetă

```bash
POST http://localhost:3000/api/medical-records/[RECORD_ID]/prescriptions
Content-Type: application/json

{
  "medicationName": "Amlodipină",
  "dosage": "5mg",
  "frequency": "1x pe zi, dimineața",
  "route": "oral",
  "quantity": "30 comprimate",
  "startDate": "2024-01-15T00:00:00Z",
  "instructions": "Luare dimineața, înainte de masă",
  "refills": 2,
  "status": "active"
}
```

#### 3.5. Adaugă Semne Vitale

```bash
POST http://localhost:3000/api/medical-records/[RECORD_ID]/vital-signs
Content-Type: application/json

{
  "bloodPressureSystolic": 140,
  "bloodPressureDiastolic": 90,
  "pulse": 78,
  "temperature": 36.5,
  "weight": 75,
  "height": 175,
  "glucoseLevel": 95
}
```

#### 3.6. Adaugă Alergie

```bash
POST http://localhost:3000/api/patients/[PATIENT_ID]/allergies
Content-Type: application/json

{
  "allergenType": "medication",
  "allergenName": "Penicilină",
  "reactionType": "allergy",
  "severity": "severe",
  "symptoms": "Erupție cutanată, dificultăți respiratorii",
  "firstOccurrenceDate": "2020-05-10T00:00:00Z",
  "status": "active",
  "reportedBy": "patient"
}
```

#### 3.7. Adaugă Vaccinare

```bash
POST http://localhost:3000/api/patients/[PATIENT_ID]/vaccinations
Content-Type: application/json

{
  "vaccineName": "COVID-19 (Pfizer-BioNTech)",
  "vaccineType": "routine",
  "administrationDate": "2023-06-15T00:00:00Z",
  "administeredBy": "Dr. Maria Ionescu",
  "lotNumber": "EW0167",
  "manufacturer": "Pfizer",
  "site": "left_arm",
  "notes": "Prima doză"
}
```

### Pasul 4: Verificare Vizuală

După ce ai adăugat date, revino la pagina de istoric medical și verifică:

1. **Carduri Summary:**
   - ✅ Numărul de consultații se actualizează
   - ✅ Numărul de alergii active se actualizează
   - ✅ Numărul de vaccinări se actualizează
   - ✅ Ultima tensiune apare în card

2. **Timeline:**
   - ✅ Evenimentele apar în ordine cronologică (cel mai recent primul)
   - ✅ Fiecare consultație are cardul propriu
   - ✅ Alergiile apar cu culoare roșie
   - ✅ Vaccinările apar cu culoare albastră

3. **Detalii Consultație:**
   - ✅ Se afișează doctorul cu poza
   - ✅ Motivele consultației
   - ✅ Diagnosticurile (cu badge-uri colorate)
   - ✅ Rețetele (cu detalii complete)
   - ✅ Semnele vitale (tensiune, puls, temperatură, greutate)
   - ✅ Planul de tratament

### Pasul 5: Testare Scenarii Multiple

#### Scenariul 1: Consultație cu Multiple Diagnosticuri

Adaugă o consultație cu 2-3 diagnosticuri diferite și verifică că toate apar corect.

#### Scenariul 2: Consultație cu Multiple Rețete

Adaugă o consultație cu 2-3 medicamente și verifică că toate apar în lista de rețete.

#### Scenariul 3: Istoric Lung

Adaugă 5-10 consultații cu date diferite și verifică:
- ✅ Timeline-ul se afișează corect
- ✅ Scroll-ul funcționează
- ✅ Toate consultațiile sunt vizibile

#### Scenariul 4: Alergii Multiple

Adaugă 2-3 alergii diferite și verifică că toate apar în timeline.

### Pasul 6: Testare Edge Cases

1. **Consultație fără diagnostic:**
   - Adaugă o consultație fără diagnosticuri
   - Verifică că pagina nu se strică

2. **Consultație fără rețete:**
   - Adaugă o consultație fără rețete
   - Verifică că pagina nu se strică

3. **Consultație fără semne vitale:**
   - Adaugă o consultație fără semne vitale
   - Verifică că pagina nu se strică

4. **Date vechi:**
   - Adaugă consultații cu date din trecut (1 an, 2 ani în urmă)
   - Verifică că sortarea cronologică funcționează corect

## Script Rapid de Testare (Node.js)

Poți crea un script `test-medical-history.js` pentru a adăuga date automat:

```javascript
// test-medical-history.js
const PATIENT_ID = "YOUR_PATIENT_ID_HERE";
const BASE_URL = "http://localhost:3000";

async function addTestData() {
  // 1. Adaugă consultație
  const consultation = await fetch(`${BASE_URL}/api/medical-records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId: PATIENT_ID,
      doctorName: "Dr. Ion Popescu",
      recordType: "consultation",
      visitDate: new Date().toISOString(),
      chiefComplaint: "Durere de cap",
      assessment: "Hipertensiune ușoară",
      plan: "Monitorizare tensiune"
    })
  });
  const consultationData = await consultation.json();
  const recordId = consultationData.$id;

  // 2. Adaugă diagnostic
  await fetch(`${BASE_URL}/api/medical-records/${recordId}/diagnoses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      diagnosisName: "Hipertensiune arterială",
      diagnosisType: "primary",
      status: "active"
    })
  });

  // 3. Adaugă rețetă
  await fetch(`${BASE_URL}/api/medical-records/${recordId}/prescriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      medicationName: "Amlodipină",
      dosage: "5mg",
      frequency: "1x pe zi",
      startDate: new Date().toISOString(),
      status: "active"
    })
  });

  // 4. Adaugă semne vitale
  await fetch(`${BASE_URL}/api/medical-records/${recordId}/vital-signs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bloodPressureSystolic: 140,
      bloodPressureDiastolic: 90,
      pulse: 78,
      temperature: 36.5
    })
  });

  console.log("✅ Date de test adăugate cu succes!");
}

addTestData();
```

## Checklist Final

- [ ] Pagina de istoric se încarcă fără erori
- [ ] Cardurile summary afișează datele corect
- [ ] Timeline-ul afișează evenimentele în ordine cronologică
- [ ] Consultațiile afișează toate detaliile (doctor, diagnosticuri, rețete, semne vitale)
- [ ] Alergiile apar în timeline cu culoare roșie
- [ ] Vaccinările apar în timeline cu culoare albastră
- [ ] Link-ul din dashboard funcționează
- [ ] Nu există erori în consolă
- [ ] Design-ul este responsive (testează pe mobile)

## Note Importante

1. **Patient ID vs User ID:**
   - `userId` = ID-ul utilizatorului (din tabelul `users`)
   - `patientId` = ID-ul pacientului (din tabelul `patients`)
   - Pentru API-uri, folosește `patientId` (patient.id)

2. **Obținere Patient ID:**
   - Poți verifica în baza de date SQLite: `data/carepulse.db`
   - Sau adaugă un console.log în pagina de dashboard pentru a vedea `patient.id`

3. **Date de Test:**
   - Folosește date reale pentru a testa validarea
   - Testează cu date din trecut și viitor
   - Testează cu date invalide pentru a verifica validarea

## Suport

Dacă întâmpini probleme:
1. Verifică consola browser-ului pentru erori
2. Verifică Network tab pentru request-uri eșuate
3. Verifică baza de date pentru a vedea dacă datele au fost salvate
4. Verifică că `patientId` este corect
