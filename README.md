# SmartLog Monitor
 
> Open-source incident management system for IT and OT environments — with full traceability, role-based access control, and operational dashboards.
 
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Laura3776/Proyecto-3-Un-c-digo-abierto-para-la-transformaci-n-digital)
[![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen.svg)](https://github.com/Laura3776/Proyecto-3-Un-c-digo-abierto-para-la-transformaci-n-digital)
[![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-orange.svg)](https://github.com/Laura3776/Proyecto-3-Un-c-digo-abierto-para-la-transformaci-n-digital/releases/tag/v1.0.0)
 
---
 
## Motivation
 
In many organizations — especially those managing both IT infrastructure and OT (operational technology) environments — incident management is fragmented across emails, chats, and spreadsheets. This creates blind spots: incidents are lost, response times grow, and there is no audit trail.
 
**SmartLog Monitor** was built to solve exactly this. It centralizes incident operations in a single, structured, role-aware system that tracks the full lifecycle of every issue — from the moment it is reported to its final resolution and closure confirmation.
 
The project also serves as a practical reference for digital transformation concepts: data lifecycle management, RBAC security, cloud readiness, and IT/OT integration.
 
---
 
## Features
 
- **Structured incident creation** — area, type, description, attachments, priority, severity
- **Role-based access control (RBAC)** — `reporter`, `technician`, `supervisor`, `auditor`, `admin`
- **State machine with controlled transitions** — no invalid state jumps
- **Full traceability** — every action is logged in a per-incident timeline
- **Dashboards, Kanban view, calendar, and reports**
- **Audit log** with global event history and data export
- **Admin panel** — manage users, teams, categories, and system parameters
- **Seed data included** — ready to explore with realistic incidents out of the box
---
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Data | JSON (config + seed files) |
| Storage | `localStorage` (browser, for demo) |
| Deployment | Static — no backend required |
 
---
 
## Deployment
 
### Option 1 — Open directly in browser
 
```bash
git clone https://github.com/Laura3776/Proyecto-2-Un-software-para-la-transformaci-n-digital.git
cd Proyecto-2-Un-software-para-la-transformaci-n-digital
# Open index.html in your browser
```
 
### Option 2 — Local static server (recommended)
 
Using Python:
 
```bash
python -m http.server 8000
```
 
Then open: [http://localhost:8000](http://localhost:8000)
 
Using Node.js (`npx`):
 
```bash
npx serve .
```
 
### Option 3 — Deploy to GitHub Pages
 
1. Go to your repository → **Settings** → **Pages**
2. Set source to `main` branch, root folder
3. Your app will be live at `https://<your-username>.github.io/<repo-name>/`
### Option 4 — Deploy to Netlify
 
1. Drag and drop the project folder at [netlify.com/drop](https://app.netlify.com/drop)
2. Your demo URL is instantly live — no account required
---
 
## Quick Start
 
1. Open the application in your browser
2. Select a user from the dropdown (each has a different role)
3. Click **Log in**
4. Explore the views available for that role
### Available demo users
 
| Name | Role | Team |
|---|---|---|
| Laura Díaz | Reporter | N1 |
| Carlos Méndez | Reporter | OT |
| Ana Ruiz | Technician | N1 |
| Paula León | Technician | OT |
| Marta Gil | Supervisor | N1 |
| Sofía Navas | Auditor | QA |
| Admin Root | Admin | Core |
 
---
 
## Usage Examples
 
### Creating an incident (Reporter role)
 
1. Log in as **Laura Díaz** (reporter)
2. Click **Create Incident**
3. Fill in: title, description, origin (e.g. `Application`), severity (`High`), team (`N1`)
4. Submit — the incident is created with status `New`
### Managing an incident (Technician role)
 
1. Log in as **Ana Ruiz** (technician)
2. Open your assigned incident from the technical inbox
3. Transition: `New` → `In Analysis` → `In Progress` → `Resolved`
4. Add comments and evidence at each step
### Auditing (Auditor role)
 
1. Log in as **Sofía Navas** (auditor)
2. Access **Global Query** — full read access to all incidents
3. View per-incident timeline
4. Export data as JSON
---
 
## Repository Structure
 
```
smartlog-monitor/
├── config/
│   ├── incidents_seed.json     # Sample incidents (seed data)
│   ├── policies.json           # Role definitions and permissions
│   └── users.json              # Demo user list
├── scripts/
│   ├── app.js                  # Main application logic
│   ├── main.js                 # Navigation and UI interactions
│   ├── storage.js              # localStorage persistence layer
│   └── validation.js           # Input validation and sanitization
├── styles/
│   └── main.css                # Application stylesheet
├── pages/
│   └── equipo.html             # Team and project info page
├── DOCUMENTATION/
│   ├── documentacion.html      # Full functional + academic documentation
│   ├── styles.css              # Documentation styles
│   └── app.js                  # Documentation tab/TOC logic
├── README.md
├── CONTRIBUTING.md
└── index.html                  # Application entry point
```
 
---
 
## Documentation
 
Full functional and technical documentation is available at:
 
```
DOCUMENTATION/documentacion.html
```
 
Open it in a browser (no server needed) for the complete developer and user guide with tabbed navigation.
 
---
 
## Roadmap
 
- [ ] Backend API (Node.js / Python FastAPI)
- [ ] PostgreSQL persistence layer
- [ ] Cloud deployment (Docker + CI/CD)
- [ ] Real-time notifications
- [ ] AI-powered incident classification
- [ ] REST API for ERP/MES/CMMS integration
- [ ] Mobile-responsive redesign
---
 
## Contributing
 
We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.
 
---
 
## License
 
This project is distributed under the [MIT License](LICENSE). You are free to use, modify, and redistribute it.
 
---
 
## Academic Context
 
Developed as part of **Project 2 & 3 — Software for Digital Transformation**, a practical assignment focused on:
 
- Data lifecycle management
- Role-based security (RBAC)
- IT/OT integration
- Digital Enabling Technologies (DHT)
- Open-source software practices
