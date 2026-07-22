This is the Software Design Description (SDD) plan for the Cadence Democracy Protocol. This document translates the political and social architecture engineered throughout our collaboration into a concrete, open-source technical specification for deployment on local hardware (e.g., a server in a barn).
------------------------------
## 📜 Software Design Description (SDD): Cadence Democracy Protocol
System Version: 1.0.0-BETA
Architecture Style: Federated, Unencrypted, Live-Observable Public Ledger
Core Objective: Eradicate centralized institutional fraud by moving the security layer from cryptography to physical human trust and dynamic participation math.
------------------------------
## 1. System Architecture Overview
The system bypasses traditional secure-database designs. Instead of hiding data behind encryption, it uses a Glass-Box Engine. The central web application does only one thing: write raw text logs to a public ledger.

                                [ Public Network / Internet ]
                                             │
             ┌───────────────────────────────┼──────────────────────────────┐
             ▼                               ▼                              ▼
   ┌───────────────────┐           ┌───────────────────┐          ┌───────────────────┐
   │  Public Mirror A  │           │  Public Mirror B  │          │  Public Mirror C  │
   │  (Read-Only Logs) │           │  (Read-Only Logs) │          │  (Read-Only Logs) │
   └─────────▲─────────┘           └─────────▲─────────┘          └─────────▲─────────┘
             │                               │                              │
             └───────────────────────────────┼──────────────────────────────┘
                                             │ (Continuous Database Replication)
                                   ┌─────────┴─────────┐
                                   │  BARN CORE NODE   │◄──── [ 6-Neighbor Social
                                   │ (Running App/DB)  │       Recovery Interface]
                                   └─────────▲─────────┘
                                             │
                                   ┌─────────┴─────────┐
                                   │ 1-Week / 24h Loop │
                                   │   Elastic Clock   │
                                   └─────────▲─────────┘
                                             │
                                   ┌─────────┴─────────┐
                                   │  Physical 4-5     │
                                   │  Paper Key Auth   │
                                   └───────────────────┘

------------------------------
## 2. Component Design & Specifications## Component A: The Authentication Layer (Pentakey Validation)
Instead of digital certificates, user verification relies on multi-part physical string matching.

* Data Structure: A citizen identity consists of a Public User ID hash and an array of 5 distinct high-entropy alphanumeric strings (Key_1 through Key_5).
* Authentication Logic: To submit a vote, the client-side browser must present all 5 keys simultaneously via a flat form payload.
* Execution Rule: The server hashes the incoming strings and checks them against the database record. No partial logins are allowed.

## Component B: The Elastic Clock Engine (Dynamic Timeline Controller)
The duration of a vote is completely dynamic and governed by real-time participation metrics.

* Mathematical Formula:
$$\text{Voting Window Duration} = \begin{cases} 24 \text{ Hours} & \text{if } P < 1\% \\ 7 \text{ Days} & \text{if } 1\% \le P < 10\% \\ 14 \text{ Days} & \text{if } P \ge 10\% \end{cases}$$ 
(Where $P = \frac{\text{Total Unique Votes Cast}}{\text{Total Registered Electorate Pool}} \times 100$)
* Trigger Mechanism: Every incoming vote increments the participation counter. The moment $P$ crosses a threshold ($1\%$ or $10\%$), an automated database trigger recalculates the Vote_Closing_Timestamp and updates the live network ticker.

## Component C: The Observer Layer (Live Log Streaming API)
This component provides the global programmer network with root-level visibility into system operations.

* Technology: WebSockets / Server-Sent Events (SSE).
* Operation: The server pushes every single atomic action (vote cast, account freeze, time extension) into a public read-only log pipeline (stdout).
* Reproducible Build Check: The runtime environment exposes its compiled binary hash (SHA-256) via a public endpoint. External auditors can compile the open-source code locally to verify that the live barn server hasn't been modified or tampered with.

------------------------------
## 3. Database Schema (SQLite / Flat-File)
To allow the application to run smoothly on low-power, cheap hardware (like a Raspberry Pi in a barn), the database schema is kept strictly minimal and unencrypted.
## Table: electorate

| Column Name | Data Type | Description |
|---|---|---|
| user_id | TEXT (PK) | Unencrypted public name or pseudonym chosen by user |
| key_hash | TEXT | Combined SHA-256 hash of the 5 physical paper keys |
| recovery_pwd | TEXT | Hashed backup password used strictly to freeze accounts |
| status | TEXT | Account state: ACTIVE, FROZEN, or RECOVERING |

## Table: proposals

| Column Name | Data Type | Description |
|---|---|---|
| proposal_id | INTEGER (PK) | Unique incremental ID of the issue |
| text_content | TEXT | Full text description of the bill or issue |
| created_at | TIMESTAMP | Initial submission time |
| closing_at | TIMESTAMP | Dynamic deadline managed by the Elastic Clock |
| votes_pro | INTEGER | Total "Yes" tally |
| votes_con | INTEGER | Total "No" tally |

------------------------------
## 4. Algorithmic Workflows & Protocols## Protocol 1: The Social Recovery Flow (The 6-Neighbor Reset)
When a citizen invokes a key reset after losing their paper keys, the system executes this precise workflow:

[User invokes Freeze via Backup Password] ──► Status updates to FROZEN (Votes locked)
                                                      │
[User gathers 6 verified citizens in person] ─────────┘
                                                      │
[Each of the 6 witnesses inputs 1 Personal Key] ──────▼
                                            Is Witness Key valid?
                                            ├── NO  ──► Abort Process
                                            └── YES ──► Increment Witness Counter
                                                      │
[Witness Counter reaches 6] ──────────────────────────▼
                                            Has any Witness key been used for recovery 
                                            in this 6-month cycle?
                                            ├── YES ──► Terminate (Fraud Flagged)
                                            └── NO  ──► Mark Witness Keys as "Spent"
                                                      │
                                                      ▼
                                            Generate New 5-Key Set for User 
                                            Set Status to ACTIVE

## Protocol 2: The Forking Protocol (The Ghost-Barn Defense)
If physical tyrants capture a barn server, the local community executes the following deployment protocol:

   1. Code Replication: The population downloads the core cadence-democracy-core codebase from an external public repository onto a new piece of consumer hardware.
   2. State Reinitialization: On the upcoming 6-month registration day, the 10–20 randomly selected local volunteers spin up the new server node at a new undisclosed physical location.
   3. Network Declaration: The new server issues a broadcast to neighboring nodes (Town B, Town C) containing the new server IP and its fresh user registry.
   4. Network Exclusion: The global grid verifies the community consensus, redirects all external trade and infrastructural API hooks to the new barn, and permanently blacklists the old captured server—leaving the tyrants isolated in an empty simulation loop.

------------------------------
What is our next step for this design? We can draft the HTML/CSS frontend layout for the weekly voting dashboard, write a mock script for the Elastic Clock algorithm in Python, or develop a deployment checklist for setting up the hardware.

