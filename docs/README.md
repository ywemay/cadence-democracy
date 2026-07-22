# Cadence Democracy — Documentation

## docs/concepts/ — Philosophy & Design

| File | Description |
|------|-------------|
| `brainstorm.md` | Original ideation — the complete concept exploration that defines the protocol |
| `manifesto-pamphlet.md` | Print-ready political manifesto for distribution |
| `sdd-plan.md` | Software Design Description — architecture, components, schema, deployment |

## docs/guides/ — Operational How-Tos

| File | Description |
|------|-------------|
| `printable-user-instructions-blueprint.md` | One-page printable instructions for barn wall display |
| `network-instructions-to-connect-barns-together.md` | Federated gossip network setup (WireGuard, mesh radio failback) |
| `data-synchronization-checklist.md` | Production deployment audit checklist for node integrity |
| `automated-setup-script-guide.md` | Guide to `scripts/setup-cadence.sh` — hardware initialization |

## docs/reference/ — Technical Specifications

| File | Description |
|------|-------------|
| `known-barns-file-format.md` | JSON schema for federated network peer config (`src/known-barns.json`) |
| `line-item-command-configurations.md` | WireGuard + Linux networking command reference |
| `database-query-api.md` | API route handler spec for network topology endpoints |
| `public-ledger-layout.md` | Public ledger HTML builder spec (`src/ledger-generator.js`) |
| `network-visualization-panel.md` | Network map HTML+Canvas visualization spec (`src/network-map.html`) |
| `systemd-service-config.md` | systemd service unit reference |
| `terminal-automation-routines.md` | Cycle closer cron job spec (`src/cycle-closer.js`) |
| `automated-backup-synchronization-worker.md` | Backup worker spec (`src/backup-worker.js`) |
| `backend.md` | Backend engine spec (`src/server.js`) |
| `ui.md` | Dashboard UI spec (`src/index.html`) |
| `keys-printing.md` | Physical printer agent spec (`src/printer-agent.js`) |
| `orchestrate-cadence.md` | Full-stack orchestrator spec (`scripts/orchestrate-cadence.sh`) |
| `HTML notification dashboard elements.md` | Real-time notification widget spec (`src/notifications.html`) |
| `mock-database-seed-file.md` | Database seeder spec (`src/seed-ledger.js`) |

## docs/faq/ — Frequently Asked Questions

| File | Description |
|------|-------------|
| `computer-stolen.md` | What happens if the barn server is physically stolen |
| `how a community organizes its first physical registration day.md` | First registration day logistics |
| `How this system impacts things at country-international level.md` | Country and international-level implications |
| `impact-and-transition.md` | Transitioning from existing systems |
| `international.md` | Cross-border federation |
| `power-of-root-user.md` | Root user powers and trust assumptions |

---

*All code has been extracted from these docs into `src/` and `scripts/` — these docs remain as design specifications and reference material.*
