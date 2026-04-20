const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "..", "data", "carepulse.db");
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

const now = "2026-04-12T09:00:00.000Z";

const refs = {
  patientMihai: "cc96cfab-3e2e-40cf-8505-9ecc2bbf776a",
  patientAndrada: "6ae00c6c-f98d-4ddc-9d95-c75011de9cc9",
  medicalRecordMihai: "f11b1887-d0b2-48f1-8f64-da6623f6aef7",
  medicalRecordAndrada: "039211ec-103c-46f0-a414-5bc7932d891f",
  appointmentMihai: "e092fe96-2c91-44d4-9d03-6c53f25a288c",
  appointmentAndrada: "7fb2a726-41b9-4221-8e3b-432dbf32e82a",
};

function requireRow(query, value, label) {
  const row = db.prepare(query).get(value);
  if (!row) {
    throw new Error(`Lipsește referința necesară pentru ${label}: ${value}`);
  }
  return row;
}

function upsert(table, row) {
  const columns = Object.keys(row);
  const placeholders = columns.map((column) => `@${column}`).join(", ");
  const updates = columns
    .filter((column) => column !== "id")
    .map((column) => `${column} = excluded.${column}`)
    .join(", ");

  db.prepare(`
    INSERT INTO ${table} (${columns.join(", ")})
    VALUES (${placeholders})
    ON CONFLICT(id) DO UPDATE SET ${updates}
  `).run(row);
}

function updateStock(id, data) {
  db.prepare(`
    UPDATE medication_stock
    SET quantity = @quantity,
        reservedQuantity = @reservedQuantity,
        minimumStockLevel = @minimumStockLevel,
        maximumStockLevel = @maximumStockLevel,
        reorderQuantity = @reorderQuantity,
        lastRestockedDate = @lastRestockedDate,
        lastRestockedQuantity = @lastRestockedQuantity,
        notes = @notes,
        updatedAt = @updatedAt
    WHERE id = @id
  `).run({
    id,
    updatedAt: now,
    ...data,
  });
}

function ensureBaseReferences() {
  requireRow("SELECT id FROM patients WHERE id = ?", refs.patientMihai, "pacient Mihai Popescu");
  requireRow("SELECT id FROM patients WHERE id = ?", refs.patientAndrada, "pacient Andrada Coca");
  requireRow("SELECT id FROM medical_records WHERE id = ?", refs.medicalRecordMihai, "medical record Mihai");
  requireRow("SELECT id FROM medical_records WHERE id = ?", refs.medicalRecordAndrada, "medical record Andrada");
  requireRow("SELECT id FROM appointments WHERE id = ?", refs.appointmentMihai, "programare Mihai");
  requireRow("SELECT id FROM appointments WHERE id = ?", refs.appointmentAndrada, "programare Andrada");
}

const seed = db.transaction(() => {
  ensureBaseReferences();

  const prescriptions = [
    {
      id: "demo-support-prescription-1",
      medicalRecordId: refs.medicalRecordMihai,
      medicationName: "Paracetamol",
      dosage: "500mg",
      frequency: "1 comprimat la 8 ore",
      route: "oral",
      quantity: "20 comprimate",
      startDate: "2026-04-11T08:00:00.000Z",
      endDate: "2026-04-16T08:00:00.000Z",
      instructions: "După masă, la nevoie pentru durere.",
      refills: 0,
      status: "active",
      discontinuedReason: null,
      createdAt: now,
    },
    {
      id: "demo-support-prescription-2",
      medicalRecordId: refs.medicalRecordMihai,
      medicationName: "Ceftriaxon",
      dosage: "1g",
      frequency: "1 flacon la 12 ore",
      route: "intravenos",
      quantity: "5 flacoane",
      startDate: "2026-04-11T10:00:00.000Z",
      endDate: "2026-04-14T10:00:00.000Z",
      instructions: "Administrare în secția de urgență.",
      refills: 0,
      status: "active",
      discontinuedReason: null,
      createdAt: now,
    },
    {
      id: "demo-support-prescription-3",
      medicalRecordId: refs.medicalRecordAndrada,
      medicationName: "Morfina",
      dosage: "10 mg/ml",
      frequency: "la nevoie",
      route: "injectabil",
      quantity: "5 fiole",
      startDate: "2026-04-10T09:30:00.000Z",
      endDate: "2026-04-13T09:30:00.000Z",
      instructions: "Administrare controlată, monitorizare sedare.",
      refills: 0,
      status: "active",
      discontinuedReason: null,
      createdAt: now,
    },
    {
      id: "demo-support-prescription-4",
      medicalRecordId: refs.medicalRecordAndrada,
      medicationName: "Ibuprofen",
      dosage: "400mg",
      frequency: "1 comprimat la 12 ore",
      route: "oral",
      quantity: "14 comprimate",
      startDate: "2026-04-10T11:00:00.000Z",
      endDate: "2026-04-17T11:00:00.000Z",
      instructions: "Administrare doar după reevaluare gastroenterologică.",
      refills: 0,
      status: "active",
      discontinuedReason: null,
      createdAt: now,
    },
  ];

  prescriptions.forEach((row) => upsert("prescriptions", row));

  const labOrders = [
    {
      id: "demo-support-lab-order-1",
      patientId: refs.patientMihai,
      medicalRecordId: refs.medicalRecordMihai,
      appointmentId: refs.appointmentMihai,
      orderedBy: "Dr. Adrian Stoica",
      orderedAt: "2026-04-11T07:45:00.000Z",
      status: "completed",
      priority: "urgent",
      notes: "Set analize post-intervenție pentru reevaluare rapidă.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-support-lab-order-2",
      patientId: refs.patientAndrada,
      medicalRecordId: refs.medicalRecordAndrada,
      appointmentId: refs.appointmentAndrada,
      orderedBy: "Dr. Adrian Stoica",
      orderedAt: "2026-04-11T09:15:00.000Z",
      status: "in_progress",
      priority: "normal",
      notes: "Monitorizare metabolică și funcție renală.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-support-lab-order-3",
      patientId: refs.patientMihai,
      medicalRecordId: refs.medicalRecordMihai,
      appointmentId: refs.appointmentMihai,
      orderedBy: "Dr. Adrian Stoica",
      orderedAt: "2026-04-12T08:10:00.000Z",
      status: "pending",
      priority: "stat",
      notes: "Control TDM pentru terapie antibiotică.",
      createdAt: now,
      updatedAt: now,
    },
  ];

  labOrders.forEach((row) => upsert("lab_orders", row));

  const labOrderTests = [
    {
      id: "demo-support-lab-order-test-1",
      orderId: "demo-support-lab-order-1",
      testTypeId: "lt-hemo",
      medicationId: null,
      status: "completed",
      resultValue: "11.8",
      resultUnit: "g/dL",
      referenceRange: "12-16 g/dL",
      resultAt: "2026-04-11T08:40:00.000Z",
      notes: "Anemie ușoară postoperatorie.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-support-lab-order-test-2",
      orderId: "demo-support-lab-order-1",
      testTypeId: "lt-creat",
      medicationId: null,
      status: "completed",
      resultValue: "1.1",
      resultUnit: "mg/dL",
      referenceRange: "0.7-1.2 mg/dL",
      resultAt: "2026-04-11T08:42:00.000Z",
      notes: "Funcție renală stabilă.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-support-lab-order-test-3",
      orderId: "demo-support-lab-order-2",
      testTypeId: "lt-glucose",
      medicationId: null,
      status: "completed",
      resultValue: "108",
      resultUnit: "mg/dL",
      referenceRange: "70-100 mg/dL",
      resultAt: "2026-04-11T10:05:00.000Z",
      notes: "Ușor peste intervalul de referință.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-support-lab-order-test-4",
      orderId: "demo-support-lab-order-2",
      testTypeId: "lt-urea",
      medicationId: null,
      status: "pending",
      resultValue: null,
      resultUnit: null,
      referenceRange: null,
      resultAt: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-support-lab-order-test-5",
      orderId: "demo-support-lab-order-3",
      testTypeId: "lt-vanco",
      medicationId: "med-6",
      status: "pending",
      resultValue: null,
      resultUnit: null,
      referenceRange: null,
      resultAt: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    },
  ];

  labOrderTests.forEach((row) => upsert("lab_order_tests", row));

  const labResults = [
    {
      id: "demo-support-lab-result-1",
      medicalRecordId: refs.medicalRecordMihai,
      appointmentId: refs.appointmentMihai,
      testName: "Hemoleucogramă",
      testCategory: "blood",
      resultValue: "11.8",
      unit: "g/dL",
      referenceRange: "12-16 g/dL",
      status: "abnormal",
      notes: "Control la 48h recomandat.",
      performedDate: "2026-04-11T08:45:00.000Z",
      createdAt: now,
      reviewedByDoctor: null,
      reviewedAt: null,
      noteForPatient: null,
    },
    {
      id: "demo-support-lab-result-2",
      medicalRecordId: refs.medicalRecordAndrada,
      appointmentId: refs.appointmentAndrada,
      testName: "Glicemie",
      testCategory: "blood",
      resultValue: "108",
      unit: "mg/dL",
      referenceRange: "70-100 mg/dL",
      status: "abnormal",
      notes: "Ușoară hiperglicemie, corelare clinică.",
      performedDate: "2026-04-11T10:10:00.000Z",
      createdAt: now,
      reviewedByDoctor: null,
      reviewedAt: null,
      noteForPatient: null,
    },
  ];

  labResults.forEach((row) => upsert("lab_results", row));

  const imagingStudies = [
    {
      id: "demo-support-imaging-1",
      patientId: refs.patientMihai,
      modalityId: "img-rmn",
      scheduledAt: "2026-04-15T09:00:00.000Z",
      status: "scheduled",
      sourceType: "appointment",
      sourceId: refs.appointmentMihai,
      orderedBy: "Dr. Adrian Stoica",
      reason: "RMN cerebral de control post-eveniment neurologic.",
      resultNotes: null,
      createdAt: now,
      updatedAt: now,
      reviewedByDoctor: null,
      reviewedAt: null,
      noteForPatient: null,
    },
    {
      id: "demo-support-imaging-2",
      patientId: refs.patientAndrada,
      modalityId: "img-eco",
      scheduledAt: "2026-04-16T11:20:00.000Z",
      status: "scheduled",
      sourceType: "direct",
      sourceId: null,
      orderedBy: "Admin Imagistică",
      reason: "Ecografie abdominală pentru control periodic.",
      resultNotes: null,
      createdAt: now,
      updatedAt: now,
      reviewedByDoctor: null,
      reviewedAt: null,
      noteForPatient: null,
    },
    {
      id: "demo-support-imaging-3",
      patientId: refs.patientMihai,
      modalityId: "img-ct",
      scheduledAt: "2026-04-17T14:00:00.000Z",
      status: "scheduled",
      sourceType: "emergency",
      sourceId: "eac5f04f-urgent-demo",
      orderedBy: "Dr. Adrian Stoica",
      reason: "CT de control toracic post-traumatism.",
      resultNotes: null,
      createdAt: now,
      updatedAt: now,
      reviewedByDoctor: null,
      reviewedAt: null,
      noteForPatient: null,
    },
    {
      id: "demo-support-imaging-4",
      patientId: refs.patientMihai,
      modalityId: "img-rad",
      scheduledAt: "2026-04-11T09:15:00.000Z",
      status: "completed",
      sourceType: "appointment",
      sourceId: refs.appointmentMihai,
      orderedBy: "Dr. Adrian Stoica",
      reason: "Radiografie toracică de control.",
      resultNotes: "Fără pneumotorax. Opacități bazale minime în regresie.",
      createdAt: now,
      updatedAt: now,
      reviewedByDoctor: null,
      reviewedAt: null,
      noteForPatient: null,
    },
    {
      id: "demo-support-imaging-5",
      patientId: refs.patientAndrada,
      modalityId: "img-ct",
      scheduledAt: "2026-04-11T12:30:00.000Z",
      status: "completed",
      sourceType: "appointment",
      sourceId: refs.appointmentAndrada,
      orderedBy: "Dr. Adrian Stoica",
      reason: "CT sinusuri pentru reevaluare.",
      resultNotes: "Mucoasă discret îngroșată maxilar bilateral, fără colecții.",
      createdAt: now,
      updatedAt: now,
      reviewedByDoctor: null,
      reviewedAt: null,
      noteForPatient: null,
    },
  ];

  imagingStudies.forEach((row) => upsert("imaging_studies", row));

  const pharmacyOrders = [
    {
      id: "demo-support-pharmacy-order-1",
      orderNumber: "PO-DEMO-001",
      status: "draft",
      requestedBy: "Farm. Ioana Preda",
      requestedAt: "2026-04-10T08:20:00.000Z",
      approvedBy: null,
      approvedAt: null,
      receivedBy: null,
      receivedAt: null,
      notes: "Reaprovizionare de rutină pentru analgezice.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-support-pharmacy-order-2",
      orderNumber: "PO-DEMO-002",
      status: "submitted",
      requestedBy: "Farm. Sorina Pavel",
      requestedAt: "2026-04-10T11:10:00.000Z",
      approvedBy: null,
      approvedAt: null,
      receivedBy: null,
      receivedAt: null,
      notes: "Lot sedative pentru ATI.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-support-pharmacy-order-3",
      orderNumber: "PO-DEMO-003",
      status: "received",
      requestedBy: "Farm. Maria Ionescu",
      requestedAt: "2026-04-09T07:45:00.000Z",
      approvedBy: "Director medical",
      approvedAt: "2026-04-09T09:00:00.000Z",
      receivedBy: "Farm. Maria Ionescu",
      receivedAt: "2026-04-10T14:15:00.000Z",
      notes: "Antibiotice și perfuzabile pentru urgențe.",
      createdAt: now,
      updatedAt: now,
    },
  ];

  pharmacyOrders.forEach((row) => upsert("pharmacy_orders", row));

  const pharmacyOrderLines = [
    {
      id: "demo-support-pharmacy-order-line-1",
      orderId: "demo-support-pharmacy-order-1",
      medicationId: "med-4",
      quantity: 60,
      unitPrice: 1.2,
      receivedQuantity: null,
      createdAt: now,
    },
    {
      id: "demo-support-pharmacy-order-line-2",
      orderId: "demo-support-pharmacy-order-2",
      medicationId: "med-21",
      quantity: 24,
      unitPrice: 14.5,
      receivedQuantity: null,
      createdAt: now,
    },
    {
      id: "demo-support-pharmacy-order-line-3",
      orderId: "demo-support-pharmacy-order-2",
      medicationId: "med-20",
      quantity: 30,
      unitPrice: 18.75,
      receivedQuantity: null,
      createdAt: now,
    },
    {
      id: "demo-support-pharmacy-order-line-4",
      orderId: "demo-support-pharmacy-order-3",
      medicationId: "med-6",
      quantity: 40,
      unitPrice: 9.8,
      receivedQuantity: 30,
      createdAt: now,
    },
    {
      id: "demo-support-pharmacy-order-line-5",
      orderId: "demo-support-pharmacy-order-3",
      medicationId: "med-14",
      quantity: 80,
      unitPrice: 4.1,
      receivedQuantity: 80,
      createdAt: now,
    },
  ];

  pharmacyOrderLines.forEach((row) => upsert("pharmacy_order_lines", row));

  const medicationRequests = [
    {
      id: "demo-support-medication-request-1",
      patientId: refs.patientMihai,
      prescriptionId: "demo-support-prescription-1",
      status: "approved",
      requestedAt: "2026-04-11T12:00:00.000Z",
      approvedBy: "Farm. Ioana Preda",
      approvedAt: "2026-04-11T12:15:00.000Z",
      dispensedBy: null,
      dispensedAt: null,
      decontatAt: null,
      decontatBy: null,
      decontareType: null,
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      notes: "Pacient eligibil pentru eliberare rapidă.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-support-medication-request-2",
      patientId: refs.patientMihai,
      prescriptionId: "demo-support-prescription-2",
      status: "dispensed",
      requestedAt: "2026-04-11T12:30:00.000Z",
      approvedBy: "Farm. Maria Ionescu",
      approvedAt: "2026-04-11T12:40:00.000Z",
      dispensedBy: "Farm. Maria Ionescu",
      dispensedAt: "2026-04-11T13:10:00.000Z",
      decontatAt: null,
      decontatBy: null,
      decontareType: null,
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      notes: "Eliberare din stocul de urgență.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-support-medication-request-3",
      patientId: refs.patientAndrada,
      prescriptionId: "demo-support-prescription-3",
      status: "decontat",
      requestedAt: "2026-04-10T16:10:00.000Z",
      approvedBy: "Farm. Sorina Pavel",
      approvedAt: "2026-04-10T16:20:00.000Z",
      dispensedBy: "Farm. Sorina Pavel",
      dispensedAt: "2026-04-10T16:45:00.000Z",
      decontatAt: "2026-04-11T09:30:00.000Z",
      decontatBy: "Casa internă de decontare",
      decontareType: "partial",
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      notes: "Decontare parțială conform schemei terapeutice.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-support-medication-request-4",
      patientId: refs.patientAndrada,
      prescriptionId: "demo-support-prescription-4",
      status: "rejected",
      requestedAt: "2026-04-10T17:10:00.000Z",
      approvedBy: null,
      approvedAt: null,
      dispensedBy: null,
      dispensedAt: null,
      decontatAt: null,
      decontatBy: null,
      decontareType: null,
      rejectedBy: "Farm. Ioana Preda",
      rejectedAt: "2026-04-10T17:30:00.000Z",
      rejectionReason: "Necesită reevaluare medicală din cauza riscului gastrointestinal.",
      notes: "Pacienta a fost redirecționată către medicul curant.",
      createdAt: now,
      updatedAt: now,
    },
  ];

  medicationRequests.forEach((row) => upsert("medication_requests", row));

  const stockBatches = [
    {
      id: "demo-support-stock-batch-1",
      stockId: "stock-1",
      batchNumber: "PARA-2026-04",
      expirationDate: "2026-12-15",
      quantity: 25,
      receivedAt: "2026-04-05T08:00:00.000Z",
      createdAt: now,
    },
    {
      id: "demo-support-stock-batch-2",
      stockId: "stock-2",
      batchNumber: "MORF-2026-02",
      expirationDate: "2026-07-10",
      quantity: 6,
      receivedAt: "2026-04-04T10:30:00.000Z",
      createdAt: now,
    },
    {
      id: "demo-support-stock-batch-3",
      stockId: "stock-6",
      batchNumber: "CEF-2026-03",
      expirationDate: "2026-08-01",
      quantity: 18,
      receivedAt: "2026-04-03T11:15:00.000Z",
      createdAt: now,
    },
  ];

  stockBatches.forEach((row) => upsert("medication_stock_batches", row));

  const dispensings = [
    {
      id: "demo-support-pharmacy-dispensing-1",
      prescriptionId: "demo-support-prescription-2",
      patientId: refs.patientMihai,
      medicationId: "med-6",
      stockId: "stock-6",
      batchId: "demo-support-stock-batch-3",
      quantity: 2,
      dispensedAt: "2026-04-11T13:10:00.000Z",
      dispensedBy: "Farm. Maria Ionescu",
      notes: "Primele două doze eliberate din stocul de urgență.",
      createdAt: now,
    },
    {
      id: "demo-support-pharmacy-dispensing-2",
      prescriptionId: "demo-support-prescription-3",
      patientId: refs.patientAndrada,
      medicationId: "med-2",
      stockId: "stock-2",
      batchId: "demo-support-stock-batch-2",
      quantity: 1,
      dispensedAt: "2026-04-10T16:45:00.000Z",
      dispensedBy: "Farm. Sorina Pavel",
      notes: "Eliberare controlată, cu monitorizare clinică.",
      createdAt: now,
    },
    {
      id: "demo-support-pharmacy-dispensing-3",
      prescriptionId: "9177eefd-e66d-49f6-9a1e-1ebe948982fd",
      patientId: refs.patientAndrada,
      medicationId: "med-4",
      stockId: "stock-4",
      batchId: null,
      quantity: 6,
      dispensedAt: "2026-04-10T18:05:00.000Z",
      dispensedBy: "Farm. Ioana Preda",
      notes: "Eliberare parțială pentru tratament la domiciliu.",
      createdAt: now,
    },
  ];

  dispensings.forEach((row) => upsert("pharmacy_dispensings", row));

  const interactions = [
    {
      id: "demo-support-medication-interaction-1",
      medicationId1: "med-3",
      medicationId2: "med-4",
      severity: "major",
      description: "Administrarea concomitentă a două AINS crește riscul de sângerare digestivă și insuficiență renală.",
      createdAt: now,
    },
    {
      id: "demo-support-medication-interaction-2",
      medicationId1: "med-2",
      medicationId2: "med-21",
      severity: "contraindicated",
      description: "Asocierea morfină-midazolam poate determina depresie respiratorie semnificativă și sedare excesivă.",
      createdAt: now,
    },
    {
      id: "demo-support-medication-interaction-3",
      medicationId1: "med-25",
      medicationId2: "med-4",
      severity: "moderate",
      description: "Heparina asociată cu ibuprofen necesită monitorizare pentru risc hemoragic crescut.",
      createdAt: now,
    },
  ];

  interactions.forEach((row) => upsert("medication_interactions", row));

  updateStock("stock-2", {
    quantity: 8,
    reservedQuantity: 2,
    minimumStockLevel: 10,
    maximumStockLevel: 60,
    reorderQuantity: 24,
    lastRestockedDate: "2026-04-04T10:30:00.000Z",
    lastRestockedQuantity: 6,
    notes: "Rezervat pentru urgențe neurologice și sedare controlată.",
  });

  updateStock("stock-6", {
    quantity: 9,
    reservedQuantity: 1,
    minimumStockLevel: 10,
    maximumStockLevel: 80,
    reorderQuantity: 30,
    lastRestockedDate: "2026-04-03T11:15:00.000Z",
    lastRestockedQuantity: 18,
    notes: "Consum accelerat din cauza cazurilor infecțioase din UPU.",
  });

  updateStock("stock-24", {
    quantity: 10,
    reservedQuantity: 2,
    minimumStockLevel: 10,
    maximumStockLevel: 50,
    reorderQuantity: 20,
    lastRestockedDate: "2026-04-02T09:00:00.000Z",
    lastRestockedQuantity: 12,
    notes: "Rezervă minimă ATI pentru monitorizare metabolică.",
  });
});

seed();

const summary = db.prepare(`
  SELECT 'lab_orders' as entity, COUNT(*) as count FROM lab_orders WHERE id LIKE 'demo-support-%'
  UNION ALL
  SELECT 'lab_results', COUNT(*) FROM lab_results WHERE id LIKE 'demo-support-%'
  UNION ALL
  SELECT 'imaging_studies', COUNT(*) FROM imaging_studies WHERE id LIKE 'demo-support-%'
  UNION ALL
  SELECT 'pharmacy_orders', COUNT(*) FROM pharmacy_orders WHERE id LIKE 'demo-support-%'
  UNION ALL
  SELECT 'pharmacy_dispensings', COUNT(*) FROM pharmacy_dispensings WHERE id LIKE 'demo-support-%'
  UNION ALL
  SELECT 'medication_requests', COUNT(*) FROM medication_requests WHERE id LIKE 'demo-support-%'
  UNION ALL
  SELECT 'medication_interactions', COUNT(*) FROM medication_interactions WHERE id LIKE 'demo-support-%'
  UNION ALL
  SELECT 'stock_batches', COUNT(*) FROM medication_stock_batches WHERE id LIKE 'demo-support-%'
`).all();

console.table(summary);
console.log("Seed pentru servicii suport medical aplicat în:", dbPath);
db.close();
