# Contributing to SmartLog Monitor
 
Thank you for your interest in contributing to SmartLog Monitor! This document explains how to get involved, what we are looking for, and how to submit your work.
 
---
 
## Table of Contents
 
- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Getting Started](#getting-started)
- [Development Guidelines](#development-guidelines)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Areas of Interest for Future Contributions](#areas-of-interest-for-future-contributions)
- [Required Skills](#required-skills)
- [Questions?](#questions)
---
 
## Code of Conduct
 
By participating in this project, you agree to maintain a respectful, inclusive, and constructive environment. We welcome contributors of all experience levels.
 
---
 
## How to Contribute
 
There are several ways to contribute:
 
- **Report a bug** — Open an issue with a clear description and reproduction steps
- **Suggest a feature** — Open an issue tagged `enhancement` with your proposal
- **Fix a bug** — Pick an open issue, implement the fix, and submit a pull request
- **Improve documentation** — Typos, clarity, translations, missing content
- **Add test coverage** — We currently have no automated tests — this is a great first contribution
- **Implement a roadmap item** — See the roadmap section below
---
 
## Getting Started
 
### 1. Fork the repository
 
Click **Fork** on GitHub to create your own copy.
 
### 2. Clone your fork
 
```bash
git clone https://github.com/<your-username>/smartlog-monitor.git
cd smartlog-monitor
```
 
### 3. Create a feature branch
 
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-description
```
 
### 4. Make your changes
 
Follow the development guidelines below.
 
### 5. Test locally
 
Open `index.html` in your browser or run a local server:
 
```bash
python -m http.server 8000
```
 
### 6. Commit with a clear message
 
```bash
git commit -m "feat: add email notification on incident assignment"
# or
git commit -m "fix: resolve state transition bug for OT incidents"
```
 
We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) loosely:
 
| Prefix | Use for |
|---|---|
| `feat:` | New functionality |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code restructure without behavior change |
| `style:` | Formatting, no logic change |
| `test:` | Adding or updating tests |
 
### 7. Push and open a pull request
 
```bash
git push origin feature/your-feature-name
```
 
Then go to GitHub and open a **Pull Request** against the `main` branch.
 
---
 
## Development Guidelines
 
### Code style
 
- Use **vanilla JavaScript** — no frameworks unless the PR scope justifies a major architecture decision (open an issue first)
- Prefer `const` over `let`; avoid `var`
- Use descriptive names — `validateIncidentInput` not `validate`
- Keep functions small and single-purpose
- Add **JSDoc comments** to all exported functions
Example:
 
```javascript
/**
 * Validates incident form data before submission.
 * @param {FormData} formData - The raw form data from the incident creation form.
 * @returns {{ ok: boolean, message?: string, value?: object }} Validation result.
 */
export function validateIncidentInput(formData) {
  // ...
}
```
 
### CSS
 
- Use the existing CSS custom properties (`--color-primary`, `--color-surface`, etc.)
- Do not add inline styles
- Keep selectors specific but not over-nested
- Mobile-first when adding new layout components
### Data / JSON config
 
- Do not modify `incidents_seed.json` unless adding more diverse/representative seed incidents
- Changes to `policies.json` (roles/permissions) must be discussed in an issue first — this is a security-relevant file
- Any new configurable parameter should be added to `policies.json`, not hardcoded
### File organization
 
- Logic goes in `scripts/`
- Styles go in `styles/`
- Additional pages go in `pages/`
- Configuration/seed data goes in `config/`
---
 
## Submitting a Pull Request
 
Your PR will be reviewed for:
 
1. **Correctness** — Does it do what it says? Does it break anything?
2. **Code quality** — Is it readable, well-named, appropriately commented?
3. **Scope** — Does it do one thing? Large PRs are harder to review; split if needed
4. **Consistency** — Does it match the existing style and architecture?
PRs should include:
 
- A clear title describing the change
- A short description of what was changed and why
- Reference to any related issue (`Closes #42`)
---
 
## Areas of Interest for Future Contributions
 
These are the most valuable directions for expanding SmartLog Monitor. Opening an issue before starting is recommended for larger items.
 
### Backend & persistence
- REST API using Node.js (Express) or Python (FastAPI)
- PostgreSQL schema and migration scripts
- JWT authentication and session management
### Cloud & DevOps
- Dockerfile and `docker-compose.yml`
- GitHub Actions CI/CD pipeline (lint + test + deploy)
- Deployment guide for Render, Railway, or Fly.io
### Testing
- Unit tests for `validation.js` and `storage.js` using Vitest or Jest
- End-to-end tests using Playwright
### Features
- Email/webhook notifications on incident assignment or escalation
- SLA timers and automatic escalation rules
- Batch import from CSV
- Filtering and search improvements
- Dark mode
### AI / Integrations
- Auto-classification of incidents using an LLM API
- Webhook integration with monitoring tools (e.g. Grafana alerts → new incident)
- Export to Jira or ServiceNow format
### Accessibility & UX
- ARIA labels and keyboard navigation audit
- Internationalization (i18n) support
- Improved mobile layout
---
 
## Required Skills
 
Depending on the area you want to contribute to, these are the relevant skills:
 
| Area | Skills |
|---|---|
| Frontend fixes/features | HTML, CSS, Vanilla JS |
| Backend API | Node.js or Python, REST, SQL |
| Testing | Jest / Vitest / Playwright |
| DevOps | Docker, GitHub Actions, CI/CD |
| AI integration | REST APIs, prompt engineering |
| Documentation | Markdown, technical writing |
 
No experience with all of these is required — pick the area you know best and contribute there.
 
---
 
## Questions?
 
Open an issue tagged `question` and we will answer as soon as possible.
 
We appreciate every contribution, no matter how small. Thank you for helping make SmartLog Monitor better.
