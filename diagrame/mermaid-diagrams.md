# Diagrame Mermaid - Platformă eHealth

## 1. Use Case Diagram

```mermaid
graph TB
    subgraph "Platformă eHealth"
        UC1[Autentificare]
        UC2[Înregistrare Pacient]
        UC3[Upload Document Identitate]
        UC4[Creare Programare]
        UC5[Vizualizare Programări]
        UC6[Anulare Programare]
        UC7[Selectare Pachet Analize]
        UC8[Vizualizare Istoric Medical]
        UC9[Vizualizare Consultații]
        UC10[Vizualizare Analize]
        UC11[Vizualizare Alergii]
        UC12[Vizualizare Vaccinări]
        UC13[Filtrare Medici]
        UC14[Vizualizare Detalii Doctor]
        UC15[Vizualizare Toate Programările]
        UC16[Gestionare Pacienți]
        UC17[Editare Consultație]
        UC18[Introducere Rezultate Analize]
        UC19[Creare Caz Urgență]
        UC20[Vizualizare Kanban Urgențe]
        UC21[Tranziție Stare Urgență]
        UC22[Documentare Triaj]
        UC23[Documentare Consimțământ]
        UC24[Documentare Plan Îngrijire]
        UC25[Documentare Externare]
        UC26[Programare Medici Gardă]
        UC27[Vizualizare Workload]
        UC28[Generare Rotație Automată]
        UC29[Vizualizare Notificări]
        UC30[Marcare Notificare Citită]
    end

    Patient[Pacient] --> UC1
    Patient --> UC2
    Patient --> UC3
    Patient --> UC4
    Patient --> UC5
    Patient --> UC6
    Patient --> UC7
    Patient --> UC8
    Patient --> UC9
    Patient --> UC10
    Patient --> UC11
    Patient --> UC12
    Patient --> UC13
    Patient --> UC14
    Patient --> UC29
    Patient --> UC30

    Doctor[Medic] --> UC1
    Doctor --> UC15
    Doctor --> UC17
    Doctor --> UC18
    Doctor --> UC19
    Doctor --> UC20
    Doctor --> UC21
    Doctor --> UC22
    Doctor --> UC23
    Doctor --> UC24
    Doctor --> UC25
    Doctor --> UC26
    Doctor --> UC27
    Doctor --> UC28

    Admin[Administrator] --> UC1
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
    Admin --> UC18
    Admin --> UC19
    Admin --> UC20
    Admin --> UC21
    Admin --> UC22
    Admin --> UC23
    Admin --> UC24
    Admin --> UC25
    Admin --> UC26
    Admin --> UC27
    Admin --> UC28

    UC2 -.->|include| UC3
    UC4 -.->|include| UC7
    UC4 -.->|include| UC13
    UC4 -.->|include| UC14
    UC8 -.->|extend| UC9
    UC8 -.->|extend| UC10
    UC8 -.->|extend| UC11
    UC8 -.->|extend| UC12
    UC21 -.->|extend| UC22
    UC21 -.->|extend| UC23
    UC21 -.->|extend| UC24
    UC21 -.->|extend| UC25
```

## 2. ER Diagram (Simplified)

```mermaid
erDiagram
    users ||--o{ patients : "has"
    users ||--o{ appointments : "creates"
    patients ||--o{ appointments : "has"
    patients ||--o{ emergency_cases : "has"
    patients ||--o{ medical_records : "has"
    patients ||--o{ allergies_adverse_reactions : "has"
    patients ||--o{ vaccinations : "has"
    patients ||--o{ family_history : "has"
    appointments ||--o{ notifications : "generates"
    appointments ||--o{ medical_records : "generates"
    appointments ||--o{ lab_results : "generates"
    emergency_cases ||--o{ emergency_state_transitions : "has"
    emergency_cases ||--o{ emergency_documents : "has"
    medical_records ||--o{ diagnoses : "contains"
    medical_records ||--o{ prescriptions : "contains"
    medical_records ||--o{ vital_signs : "contains"
    medical_records ||--o{ lab_results : "contains"
    medical_records ||--o{ procedures : "contains"

    users {
        string id PK
        string name
        string email UK
        string phone
        datetime createdAt
        datetime updatedAt
    }

    patients {
        string id PK
        string userId FK
        string name
        string email
        string phone
        date birthDate
        string gender
        string address
        string occupation
        string bloodType
        float height
        float weight
    }

    appointments {
        string id PK
        string userId FK
        string patientId FK
        datetime schedule
        string status
        string primaryPhysician
        string reason
        text analysisResults
    }

    emergency_cases {
        string id PK
        string patientId FK
        string triageLevel
        string currentState
        string assignedDoctorId
        datetime arrivalTime
        int priority
        text chiefComplaint
    }

    medical_records {
        string id PK
        string patientId FK
        string appointmentId FK
        string doctorName
        string recordType
        datetime visitDate
        text chiefComplaint
        text assessment
        text plan
    }

    diagnoses {
        string id PK
        string medicalRecordId FK
        string diagnosisCode
        string diagnosisName
        string diagnosisType
        string status
    }

    prescriptions {
        string id PK
        string medicalRecordId FK
        string medicationName
        string dosage
        string frequency
        date startDate
        string status
    }

    lab_results {
        string id PK
        string medicalRecordId FK
        string appointmentId FK
        string testName
        string resultValue
        string referenceRange
        string status
    }
```

## 3. Sequence Diagram - Creare Programare

```mermaid
sequenceDiagram
    participant P as Pacient
    participant F as Frontend
    participant API as API Route
    participant DB as DB Helpers
    participant SQL as SQLite
    participant N as Notification Service

    P->>F: Accesează new-appointment
    F->>F: Încarcă specializări, medici, pachete
    P->>F: Selectează specializare
    F->>F: Filtrează medici
    P->>F: Selectează doctor
    F->>F: Afișează metadate doctor
    P->>F: Selectează pachet analize
    P->>F: Selectează dată/oră
    P->>F: Completează motiv
    P->>F: Submit formular
    F->>API: POST /api/appointments
    API->>DB: createAppointment(params)
    DB->>SQL: INSERT INTO appointments
    SQL-->>DB: appointmentId
    DB-->>API: Appointment object
    API->>N: createNotification()
    N->>SQL: INSERT INTO notifications
    SQL-->>N: notificationId
    N-->>API: Success
    API-->>F: 200 OK
    F->>F: Redirect success page
    F-->>P: Confirmare programare
```

## 4. State Machine - Emergency Case

```mermaid
stateDiagram-v2
    [*] --> Arrival: Creare caz
    Arrival --> Triage: Documentare triaj
    Triage --> Consent: Obținere consimțământ
    Consent --> Admission: Documentare plan îngrijire
    Admission --> Treatment: Începere tratament
    Treatment --> Discharge: Documentare externare
    Discharge --> [*]: Finalizare caz
    
    note right of Arrival
        Stare inițială
        Se înregistrează pacientul
    end note
    
    note right of Triage
        Evaluare prioritate
        Documentare semne vitale
    end note
    
    note right of Consent
        Consimțământ informat
        Semnătură pacient
    end note
    
    note right of Admission
        Plan de îngrijire
        Alocare resurse
    end note
    
    note right of Treatment
        Tratament medical
        Monitorizare
    end note
    
    note right of Discharge
        Scrisoare externare
        Instrucțiuni follow-up
    end note
```

## 5. Component Diagram

```mermaid
graph TB
    subgraph "Frontend - Next.js"
        Pages[Pages]
        Components[Components]
        Forms[Forms]
        UI[UI Components]
    end

    subgraph "Backend - API Routes"
        AuthAPI[Auth API]
        AppointmentAPI[Appointment API]
        EmergencyAPI[Emergency API]
        MedicalAPI[Medical Records API]
        AnalysisAPI[Analysis API]
    end

    subgraph "Services"
        AuthService[Auth Service]
        AppointmentService[Appointment Service]
        EmergencyService[Emergency Service]
        MedicalService[Medical Record Service]
        AnalysisService[Analysis Service]
    end

    subgraph "Database Layer"
        Helpers[DB Helpers]
        SQLite[(SQLite Database)]
    end

    Pages --> Components
    Components --> Forms
    Forms --> UI
    Pages --> AuthAPI
    Pages --> AppointmentAPI
    Pages --> EmergencyAPI
    Pages --> MedicalAPI
    Pages --> AnalysisAPI
    
    AuthAPI --> AuthService
    AppointmentAPI --> AppointmentService
    EmergencyAPI --> EmergencyService
    MedicalAPI --> MedicalService
    AnalysisAPI --> AnalysisService
    
    AuthService --> Helpers
    AppointmentService --> Helpers
    EmergencyService --> Helpers
    MedicalService --> Helpers
    AnalysisService --> Helpers
    
    Helpers --> SQLite
```
