const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'carepulse.db');
const db = new Database(dbPath);

console.log('='.repeat(80));
console.log('BAZA DE DATE - eHealth.ro');
console.log('='.repeat(80));

// Users
console.log('\n📋 UTILIZATORI (users):');
console.log('-'.repeat(80));
const users = db.prepare('SELECT * FROM users').all();
if (users.length === 0) {
  console.log('Nu există utilizatori în baza de date.');
} else {
  users.forEach((user, index) => {
    console.log(`\n${index + 1}. ID: ${user.id}`);
    console.log(`   Nume: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Parolă (hash): ${user.password.substring(0, 20)}...`);
    console.log(`   Creat la: ${user.createdAt}`);
    console.log(`   Actualizat la: ${user.updatedAt}`);
  });
}

// Patients
console.log('\n\n👤 PACIENTI (patients):');
console.log('-'.repeat(80));
const patients = db.prepare('SELECT * FROM patients').all();
if (patients.length === 0) {
  console.log('Nu există pacienți în baza de date.');
} else {
  patients.forEach((patient, index) => {
    console.log(`\n${index + 1}. ID: ${patient.id}`);
    console.log(`   User ID: ${patient.userId}`);
    console.log(`   Nume: ${patient.name}`);
    console.log(`   Email: ${patient.email}`);
    console.log(`   Telefon: ${patient.phone}`);
    console.log(`   Data nașterii: ${patient.birthDate}`);
    console.log(`   Gen: ${patient.gender}`);
    console.log(`   Adresă: ${patient.address}`);
    console.log(`   Ocupație: ${patient.occupation}`);
    console.log(`   Medic de familie: ${patient.primaryPhysician}`);
    console.log(`   Asigurător: ${patient.insuranceProvider}`);
    console.log(`   Număr poliță: ${patient.insurancePolicyNumber}`);
    console.log(`   Creat la: ${patient.createdAt}`);
  });
}

// Appointments
console.log('\n\n📅 PROGRAMĂRI (appointments):');
console.log('-'.repeat(80));
const appointments = db.prepare(`
  SELECT 
    a.*,
    p.name as patient_name,
    p.email as patient_email
  FROM appointments a
  JOIN patients p ON a.patientId = p.id
  ORDER BY a.schedule DESC
`).all();

if (appointments.length === 0) {
  console.log('Nu există programări în baza de date.');
} else {
  appointments.forEach((apt, index) => {
    console.log(`\n${index + 1}. ID: ${apt.id}`);
    console.log(`   User ID: ${apt.userId}`);
    console.log(`   Pacient: ${apt.patient_name} (${apt.patient_email})`);
    console.log(`   Programare: ${apt.schedule}`);
    console.log(`   Status: ${apt.status}`);
    console.log(`   Medic: ${apt.primaryPhysician}`);
    console.log(`   Motiv: ${apt.reason || 'N/A'}`);
    console.log(`   Notă: ${apt.note || 'N/A'}`);
    console.log(`   Creat la: ${apt.createdAt}`);
  });
}

console.log('\n' + '='.repeat(80));
console.log(`Total: ${users.length} utilizatori, ${patients.length} pacienți, ${appointments.length} programări`);
console.log('='.repeat(80));

db.close();
