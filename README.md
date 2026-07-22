# Cadence Democracy Protocol

> **⚠️ DISCLAIMER — Thought Experiment. Not Production Software.**
> This project is a pure thought experiment exploring the technical and social design of a hypothetical direct-democracy protocol. The code, documentation, and architecture were generated through brainstorming with AI. **None of this has been audited, tested, or validated for real-world use.**
>
> Before any deployment involving real people, votes, money, or governance, this system requires:
> * **Independent security audits** of all code
> * **Real-world stress testing** with qualified developers
> * **Legal and ethical review** by domain experts
> * **Community consent** from every person it would affect
>
> Treat everything here as speculative design fiction unless proven otherwise.
> Security through physical trust, not cryptography.

Cadence Democracy is an open-source protocol for continuous direct democracy with instant recall. It bypasses centralized institutional fraud by moving the security layer from cryptography to physical human interaction — paper keys printed by local volunteers, verified face-to-face.

## Core concepts

- **Physical authentication** — citizens get 5 paper keys every 6 months from randomly selected local volunteers. No digital identity, no cloud database to hack.
- **Elastic Clock Engine** — vote deadlines stretch dynamically based on participation. Low turnout = fast 24h cycles. High turnout = extended 7–14 day windows that prevent emotional mob rule.
- **Federated barn nodes** — each community runs its own server (a "barn"). Barns gossip votes to each other via encrypted WireGuard tunnels with mesh radio fallback.
- **Glass-box ledger** — every action is logged to a public, unencrypted, human-readable log. No secrets. Anyone can audit the math.
- **Social recovery** — if you lose your keys, 6 physical neighbors can restore your identity. No help desk, no ID card reissue.

## Project structure

```
cadence-democracy/
├── src/              # Application source code
│   ├── server.js              — Core HTTP server & routing
│   ├── index.html             — Dashboard UI
│   ├── network-routes.js      — Network topology API
│   ├── network-map.html       — Visual network panel
│   ├── ledger-generator.js    — Public ledger HTML builder
│   ├── backup-worker.js       — Automated backup sync
│   ├── cycle-closer.js        — Deadline enforcement
│   ├── printer-agent.js       — Physical key printer agent
│   ├── seed-ledger.js         — Test data seeder
│   ├── notifications.html     — Real-time notification widget
│   └── known-barns.json       — Network peer configuration
├── scripts/          # Deployment & infrastructure scripts
│   ├── orchestrate-cadence.sh — Full-stack orchestrator
│   ├── setup-cadence.sh       — Hardware initialization
│   └── systemd/               — systemd service units
├── docs/             # Documentation
│   ├── concepts/              — Philosophy, SDD, brainstorm
│   ├── guides/                — Operational how-tos
│   ├── specs/                 — Technical specifications
│   └── faq/                   — Frequently asked questions
├── package.json
└── README.md
```

## Quick start

```bash
# Clone and install
git clone <repo-url> cadence-democracy
cd cadence-democracy
npm install

# Seed test data
node src/seed-ledger.js

# Start the server
node src/server.js
```

For full deployment on a barn server, see `scripts/orchestrate-cadence.sh` or the setup guide in `docs/guides/`.

## Design philosophy

1. **No encryption** — encrypted data is a black box. The system must be auditable by any citizen with basic math skills.
2. **Physical trust** — face-to-face human verification is the only hack-proof authentication layer.
3. **Low-power hardware** — must run on a Raspberry Pi in a barn. No cloud, no datacenter.
4. **Social recovery** — communities protect themselves. No central authority to appeal to.

## License

AGPL-3.0 — see LICENSE. This is public infrastructure code. Any modified version deployed to serve a community must also be open source.
