# Questions - Project 3 (SmartLog Monitor)
 
## Reference Company: TecnoPlanta S.A.
 
TecnoPlanta S.A. is a medium-sized industrial company (250 employees) dedicated to the manufacturing of electronic components for the automotive sector. It has a production plant in Valencia and headquarters in Madrid. It manages IT environments (ERP, CRM, corporate email, network) and OT environments (automated assembly lines, IoT sensors, PLCs, and quality control cameras). Historically, incident management was handled via email and WhatsApp, without traceability, SLA, or centralized control.
 
---
 
## Criterion 6a) Strategic objectives
 
### What specific strategic objectives of the company does your software address?
 
TecnoPlanta S.A. has the following strategic objectives for the 2025-2027 period:
 
1. **Reduce the average incident resolution time** by 40% in order to maintain the operational continuity of the production line.
2. **Eliminate dependency on informal channels** (email, WhatsApp) for the communication of technical failures.
3. **Comply with ISO 9001 audit requirements** — every corrective action must be documented and traceable.
4. **Prepare the technological infrastructure** for future integration with the SAP ERP and the plant MES system.
SmartLog Monitor directly addresses the first three: it centralizes incident operations, eliminates informal channels through a structured workflow, and provides full traceability (timeline per incident, global audit log) that meets ISO 9001 record-keeping requirements.
 
### How does the software align with the overall digitalization strategy?
 
TecnoPlanta S.A.'s digitalization strategy follows a phased model: first standardize operational processes, then integrate them with third-party systems, and finally incorporate advanced analytics and AI. SmartLog Monitor fits into **phase 1** (standardization): it defines a single incident workflow with statuses, roles, and evidence, creating the operational database that later phases will require. The modular software architecture (separation between logic, persistence, and configuration) is designed to facilitate evolution toward a cloud backend in phase 2.
 
---
 
## Criterion 6b) Business areas and communications
 
### Which company areas benefit the most from your software?
 
- **Production / OT**: this is the area with the greatest impact. Plant incidents (IoT sensors, equipment, line failures) have direct consequences on productivity. With SmartLog Monitor, every failure is recorded, assigned to an OT technician, and tracked until closure, with visible SLA.
- **IT / Technical support**: manages incidents related to applications, network, and servers. The structured workflow by teams (N1, N2, Infra) replaces disorganized email inboxes.
- **Management / Supervision**: gains access to dashboards with the real status of incidents, workload per technician, and resolution times — information that previously did not exist in a consolidated way.
- **Quality (QA)**: the auditor role allows reviewing full traceability without intervening in the workflow, facilitating internal and external audits.
### What operational impact do you expect on daily operations?
 
- Reduction in incident assignment time: from hours (via email) to minutes (direct notification in the technician's inbox).
- Elimination of "lost" incidents: the system prevents closing an incident without confirmation from the reporter.
- Visibility of workload by technician and team, enabling proactive redistribution.
- Automatic time tracking (creation, assignment, resolution, closure) that feeds operational KPIs.
- Reduction of errors caused by informal communication: the comments and evidence field in each transition requires documentation of the work performed.
---
 
## Criterion 6c) Areas susceptible to digitalization
 
### Which company areas are most susceptible to being digitalized with your software?
 
1. **OT incident management** — currently managed through walkie-talkies and paper. With SmartLog Monitor, every operator can report a failure from any device and the plant supervisor can see the status in real time.
2. **First-level IT support (N1/N2)** — currently managed in individual email inboxes without SLA or shared visibility.
3. **Quality control** — process failures detected in internal audits can be recorded as incidents of type "Quality", creating a traceable history linked to corrective actions.
4. **Preventive maintenance management** — by adapting incident types, scheduled maintenance can also be recorded, unifying corrective and preventive processes in the same system.
### How will digitalization improve operations in those areas?
 
In OT production, digitalization eliminates the "telephone game" between operator, technician, and supervisor. In IT, it makes it possible for the first time to measure the real performance of support (MTTR, volume by team, recurrence of failures). In quality, it turns audit findings into searchable and exportable records. In maintenance, it enables prediction of failure patterns based on the incident history.
 
---
 
## Criterion 6d) Fit between digitalized areas and those that are not
 
### How do the digitalized and non-digitalized areas interact?
 
The areas most resistant to immediate digitalization at TecnoPlanta S.A. are:
- **Line operators**: they use basic devices and are not accustomed to management software.
- **External suppliers**: when an incident involves a supplier (e.g., corporate VPN, external hardware), the workflow breaks because the supplier does not have access to the system.
- **Warehouse and logistics**: they manage their own incidents in a completely manual way.
Currently, the digitalized areas (IT, supervision) must "translate" the information coming from the non-digitalized areas in order to enter it into SmartLog Monitor. This generates duplication of work and possible loss of information.
 
### What solutions or improvements would you propose to integrate these areas?
 
1. **Simplified reporting portal**: a minimal view (only title, area, and description) accessible from any mobile device, without the need for full login, for line operators.
2. **Public form via link** for external suppliers, which generates an incident without access to the internal system.
3. **Integration with WhatsApp Business API** — since operators already use WhatsApp, a simple bot can create incidents directly from the conversation.
4. **Extension to the warehouse**: create a "Warehouse" team in the configuration and train a person in charge as supervisor of that team.
---
 
## Criterion 6e) Present and future needs
 
### What current company needs does your software solve?
 
| Current need | How SmartLog Monitor solves it |
|---|---|
| No centralized incident registry | Single database with complete history |
| No action traceability | Timeline per incident with user, role, and timestamp |
| No priority control | Configurable priority field + supervisor management |
| No visibility of technician workload | Assignment view by technician and team |
| No ISO 9001 audit support | Exportable global log + auditor role with full access |
| Incidents "lost" in email | Controlled statuses + closure confirmation by reporter |
 
### What future needs does the project roadmap cover?
 
- **Automatic notifications** (email/webhook): when an incident is assigned or escalated, the technician is notified without needing to manually check the system.
- **Configurable SLA with alerts**: define maximum times by severity and receive alerts when deadlines are approaching.
- **Integration with SAP ERP**: export resolved incidents as work orders or maintenance records.
- **AI for automatic classification**: based on history, the system can suggest team, technician, and priority when creating a new incident.
- **Predictive analytics**: identify equipment or areas with recurring failure patterns before a production line stoppage occurs.
---
 
## Criterion 6f) Relationship with enabling digital technologies
 
### Which enabling technologies have you used and how do they impact the company areas?
 
| Enabling technology | Application in SmartLog Monitor | Impacted area |
|---|---|---|
| **Cloud Computing** | Static deployment (GitHub Pages / Netlify); roadmap toward cloud backend with PostgreSQL | IT, Production |
| **Big Data / Analytics** | Operational KPIs (MTTR, volume, recurrence); supervision dashboards | Management, QA |
| **Cybersecurity** | RBAC, input validation, audit log, separation of duties | All |
| **IoT** | Incidents originating from IoT (OT sensors) are a native incident type in the system | OT Production |
| **Automation** | State transition rules, automatic validation, future assignment automation | IT, OT |
| **Artificial Intelligence** (roadmap) | Automatic classification and prioritization of incidents | IT, OT |
| **Systems integration / API** (roadmap) | Connection with ERP, MES, CMMS via REST API | Production, IT |
 
### What specific benefits does the implementation of these technologies provide?
 
- **Cloud**: 24/7 availability, access from plant and office, without dependency on local servers.
- **Analytics**: management can make decisions based on real data (which team has the highest workload? which area generates the most critical incidents?).
- **RBAC + audit**: reduces the risk of record manipulation and facilitates response to quality inspections.
- **IoT integration**: when an OT sensor fails, the system can automatically receive an incident from the monitoring system, without manual intervention.
---
 
## Criterion 6g) Security gaps
 
### What possible security gaps could arise when implementing your software?
 
1. **Privilege escalation**: a user with the `reporter` role could attempt to execute actions reserved for `supervisor` by manipulating direct calls to JavaScript functions, since the current version is purely client-side.
2. **Data exposure in localStorage**: incident data (potentially containing sensitive plant information) is stored in the browser without encryption.
3. **Lack of real authentication**: the current login system is a simulation — there are no passwords or secure sessions.
4. **Injection in text fields**: although basic sanitization exists, without a backend, validation can be bypassed.
5. **Access to attachments**: attachment names are stored but there is no access control over the physical files.
6. **No session expiration**: a shared device could remain logged in indefinitely.
### What concrete measures would you propose to mitigate them?
 
| Gap | Mitigation measure |
|---|---|
| Privilege escalation | Permission validation in backend (not only on client side) |
| Exposure in localStorage | Migration to server session + encryption of sensitive data at rest |
| Weak authentication | JWT with expiration + 2FA for critical roles (supervisor, admin, auditor) |
| Form injection | Sanitization and validation also in backend; Content Security Policy (CSP) |
| Access to attachments | Object storage with signed short-lived URLs (e.g., AWS S3 presigned URLs) |
| No session expiration | Configurable inactivity timeout (e.g., 30 min) |
 
Additionally, in production it would be recommended to implement: periodic permission audits, active monitoring of failed access attempts, and an incident response plan for security breaches.
 
---
 
## Criterion 6h) Data processing and analysis
 
### How is data managed in your software and what methodologies do you use?
 
The data lifecycle in SmartLog Monitor follows these phases:
 
1. **Capture**: data entered by the user in structured forms (title, description, origin, severity, category, priority, team, attachment).
2. **Validation**: the `validation.js` module applies business rules before persisting any data (minimum length, allowed values through `Set`, sanitization of spaces and characters).
3. **Normalization**: the `normalizeImportedIncident()` function ensures consistency when importing external data, applying default values for optional fields.
4. **Persistence**: `storage.js` manages writing/reading in `localStorage` with JSON serialization. In production, this module would be replaced by calls to a REST API.
5. **Append-only traceability**: every status change, assignment, or comment is added to the incident’s `timeline` array — previous entries are never overwritten.
6. **Export**: data can be exported as JSON with metadata (version, generation date).
7. **Closure and retention**: closed incidents are retained for audit and historical purposes. The retention policy and eventual anonymization would be applied in the production backend layer.
### What do you do to guarantee data quality and consistency?
 
- **Unique IDs per incident** — generated with `crypto.randomUUID()` to avoid collisions.
- **Sets of allowed values** — origin, severity, priority, category, and team are validated against fixed `Set` values, preventing arbitrary values.
- **Controlled state transitions** — the system only allows valid transitions according to the role and current state, avoiding inconsistent states.
- **ISO 8601 timestamps** — all timeline events use the standard format for consistency.
- **Validation on import** — `normalizeImportedIncident()` rejects records with invalid mandatory fields, returning `null` instead of persisting corrupt data.
- **Authorship record** — every timeline entry includes `by: "role:id"`, ensuring that every change has an identified responsible party.
