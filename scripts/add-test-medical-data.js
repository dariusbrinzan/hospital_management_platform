/**
 * Script pentru adăugare rapidă de date de test pentru istoric medical
 * 
 * Utilizare:
 * 1. Deschide terminal în folderul healthcare
 * 2. Obține PATIENT_ID folosind una dintre metodele:
 *    - Accesează: http://localhost:3000/api/debug/patient-id (după autentificare)
 *    - Sau verifică în dashboard-ul pacientului
 * 3. Editează PATIENT_ID mai jos cu ID-ul real
 * 4. Rulează: node scripts/add-test-medical-data.js
 * 
 * NOTĂ: Acest script necesită ca serverul să ruleze (npm run dev)
 */

const PATIENT_ID = "REPLACE_WITH_YOUR_PATIENT_ID";
const BASE_URL = "http://localhost:3000";

// Verifică dacă PATIENT_ID a fost setat
if (PATIENT_ID === "REPLACE_WITH_YOUR_PATIENT_ID") {
  console.error("❌ Te rog setează PATIENT_ID în script!");
  console.log("💡 Poți găsi patientId în dashboard-ul pacientului sau în baza de date");
  process.exit(1);
}

async function addTestData() {
  console.log("🚀 Încep adăugarea datelor de test...\n");

  try {
    // 1. Adaugă prima consultație
    console.log("📝 Adaug consultație 1...");
    const consultation1 = await fetch(`${BASE_URL}/api/medical-records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: PATIENT_ID,
        doctorName: "Dr. Ion Popescu",
        recordType: "consultation",
        visitDate: new Date("2024-01-15T10:00:00Z").toISOString(),
        chiefComplaint: "Durere de cap persistentă de 3 zile",
        subjectiveNotes: "Pacientul raportează dureri de cap moderate, agravate dimineața. Nu are febră.",
        objectiveFindings: "Pacient alert, orientat. Tensiune arterială: 140/90 mmHg. Puls: 78 bpm. Temperatură: 36.5°C. Fără semne neurologice focale.",
        assessment: "Hipertensiune arterială esențială ușoară. Dureri de cap probabil secundare hipertensiunii.",
        plan: "Monitorizare tensiune arterială zilnică. Tratament antihipertensiv. Revenire peste 2 săptămâni pentru evaluare. Dacă simptomele persistă, consult cardiolog."
      })
    });

    if (!consultation1.ok) {
      throw new Error(`Eroare la crearea consultației: ${consultation1.statusText}`);
    }

    const consultation1Data = await consultation1.json();
    const recordId1 = consultation1Data.$id;
    console.log("✅ Consultație 1 creată:", recordId1);

    // Adaugă diagnostic pentru consultația 1
    console.log("🔍 Adaug diagnostic...");
    await fetch(`${BASE_URL}/api/medical-records/${recordId1}/diagnoses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        diagnosisName: "Hipertensiune arterială esențială",
        diagnosisCode: "I10",
        diagnosisType: "primary",
        status: "active",
        notes: "Hipertensiune ușoară, necesită monitorizare și tratament"
      })
    });
    console.log("✅ Diagnostic adăugat");

    // Adaugă rețetă pentru consultația 1
    console.log("💊 Adaug rețetă...");
    await fetch(`${BASE_URL}/api/medical-records/${recordId1}/prescriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medicationName: "Amlodipină",
        dosage: "5mg",
        frequency: "1x pe zi, dimineața",
        route: "oral",
        quantity: "30 comprimate",
        startDate: new Date("2024-01-15T00:00:00Z").toISOString(),
        instructions: "Luare dimineața, înainte de masă, cu apă",
        refills: 2,
        status: "active"
      })
    });
    console.log("✅ Rețetă adăugată");

    // Adaugă semne vitale pentru consultația 1
    console.log("📊 Adaug semne vitale...");
    await fetch(`${BASE_URL}/api/medical-records/${recordId1}/vital-signs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bloodPressureSystolic: 140,
        bloodPressureDiastolic: 90,
        pulse: 78,
        temperature: 36.5,
        oxygenSaturation: 98,
        respiratoryRate: 16,
        weight: 75,
        height: 175,
        glucoseLevel: 95
      })
    });
    console.log("✅ Semne vitale adăugate");

    // 2. Adaugă a doua consultație (mai recentă)
    console.log("\n📝 Adaug consultație 2...");
    const consultation2 = await fetch(`${BASE_URL}/api/medical-records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: PATIENT_ID,
        doctorName: "Dr. Maria Ionescu",
        recordType: "consultation",
        visitDate: new Date("2024-02-20T14:30:00Z").toISOString(),
        chiefComplaint: "Control după tratament hipertensiune",
        subjectiveNotes: "Pacientul raportează îmbunătățire a durerilor de cap. Tensiunea s-a normalizat.",
        objectiveFindings: "Tensiune arterială: 125/80 mmHg. Puls: 72 bpm. Temperatură: 36.4°C. Stare generală bună.",
        assessment: "Hipertensiune arterială controlată cu tratament. Durerile de cap au dispărut.",
        plan: "Continuare tratament. Monitorizare continuă. Revenire peste 3 luni."
      })
    });

    const consultation2Data = await consultation2.json();
    const recordId2 = consultation2Data.$id;
    console.log("✅ Consultație 2 creată:", recordId2);

    // Adaugă semne vitale pentru consultația 2
    await fetch(`${BASE_URL}/api/medical-records/${recordId2}/vital-signs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bloodPressureSystolic: 125,
        bloodPressureDiastolic: 80,
        pulse: 72,
        temperature: 36.4,
        weight: 74,
        height: 175
      })
    });

    // 3. Adaugă alergie
    console.log("\n⚠️ Adaug alergie...");
    await fetch(`${BASE_URL}/api/patients/${PATIENT_ID}/allergies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        allergenType: "medication",
        allergenName: "Penicilină",
        reactionType: "allergy",
        severity: "severe",
        symptoms: "Erupție cutanată generalizată, dificultăți respiratorii, edem facial",
        firstOccurrenceDate: new Date("2020-05-10T00:00:00Z").toISOString(),
        lastOccurrenceDate: new Date("2020-05-10T00:00:00Z").toISOString(),
        status: "active",
        notes: "Alergie cunoscută. Evitare strictă a penicilinei și derivaților.",
        reportedBy: "patient"
      })
    });
    console.log("✅ Alergie adăugată");

    // 4. Adaugă vaccinare
    console.log("\n💉 Adaug vaccinare...");
    await fetch(`${BASE_URL}/api/patients/${PATIENT_ID}/vaccinations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vaccineName: "COVID-19 (Pfizer-BioNTech)",
        vaccineType: "routine",
        administrationDate: new Date("2023-06-15T10:00:00Z").toISOString(),
        administeredBy: "Dr. Maria Ionescu",
        lotNumber: "EW0167",
        manufacturer: "Pfizer",
        site: "left_arm",
        notes: "Prima doză. Fără reacții adverse."
      })
    });
    console.log("✅ Vaccinare adăugată");

    // 5. Adaugă o altă vaccinare
    await fetch(`${BASE_URL}/api/patients/${PATIENT_ID}/vaccinations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vaccineName: "Gripă sezonieră 2023-2024",
        vaccineType: "seasonal",
        administrationDate: new Date("2023-10-20T09:00:00Z").toISOString(),
        administeredBy: "Dr. Ion Popescu",
        lotNumber: "FLU2023-45",
        manufacturer: "Sanofi",
        site: "right_arm"
      })
    });
    console.log("✅ A doua vaccinare adăugată");

    console.log("\n🎉 Toate datele de test au fost adăugate cu succes!");
    console.log("\n📋 Următorii pași:");
    console.log("1. Accesează pagina de istoric medical: /patients/[userId]/medical-history");
    console.log("2. Verifică că toate datele apar corect în timeline");
    console.log("3. Verifică cardurile summary");
    console.log("4. Verifică detaliile fiecărei consultații");

  } catch (error) {
    console.error("❌ Eroare la adăugarea datelor:", error);
    console.error("\n💡 Verifică:");
    console.error("- Că serverul rulează pe", BASE_URL);
    console.error("- Că PATIENT_ID este corect");
    console.error("- Că baza de date este accesibilă");
  }
}

// Rulează scriptul
addTestData();
