# Diagrame UML pentru Platformă eHealth

Acest director conține toate diagramele necesare pentru raportul de disertație.

## Diagrame Disponibile

### 1. Use Case Diagram (`use-case-diagram.puml`)
- Prezintă toate funcționalitățile sistemului
- Actori: Pacient, Medic, Administrator
- Use case-uri pentru toate modulele principale

### 2. ER Diagram (`er-diagram.puml`)
- Diagramă entitate-relație pentru baza de date
- Prezintă toate tabelele și relațiile dintre ele
- Include toate câmpurile și cheile primare/străine

### 3. Sequence Diagrams
- **`sequence-diagram-appointment.puml`**: Fluxul de creare a unei programări
- **`sequence-diagram-emergency.puml`**: Fluxul de gestionare a unui caz de urgență
- **`sequence-diagram-medical-record.puml`**: Fluxul de adăugare/editare înregistrare medicală

### 4. Class Diagram (`class-diagram.puml`)
- Prezintă structura claselor și modelelor de domeniu
- Include servicii și helper-uri
- Relații între clase

## Cum să Vizualizezi Diagramele

### Opțiunea 1: PlantUML Online
1. Accesează http://www.plantuml.com/plantuml/uml/
2. Copiază conținutul unui fișier `.puml`
3. Lipește în editor
4. Diagrama va fi generată automat

### Opțiunea 2: PlantUML Local
1. Instalează PlantUML: `npm install -g node-plantuml`
2. Generează diagrama: `puml generate use-case-diagram.puml`
3. Sau folosește extensia PlantUML pentru VS Code

### Opțiunea 3: VS Code Extension
1. Instalează extensia "PlantUML" în VS Code
2. Deschide fișierul `.puml`
3. Apasă `Alt+D` pentru preview

### Opțiunea 4: Mermaid (Alternativă)
Dacă preferi Mermaid în loc de PlantUML, poți converti diagramele folosind un convertor online.

## Structura Diagramelor

Toate diagramele folosesc PlantUML syntax și pot fi exportate în:
- PNG
- SVG
- PDF
- LaTeX

Pentru export, folosește PlantUML server sau extensia VS Code.
