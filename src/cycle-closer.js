/**
 * CADENCE DEMOCRACY PROTOCOL - DEADLINE ENFORCEMENT & CYCLE CLOSER v1.0.0
 * Run locally on the barn machine: node src/cycle-closer.js
 * Objective: Automated, machine-enforced lockdown of expired vote parameters.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, '..', 'cadence_ledger.json');
const LOG_FILE = path.join(__dirname, '..', 'public_runtime.log');

console.log("=============================================================");
console.log("CADENCE DEMOCRACY: AUTOMATED TERMINAL DEADLINE ENFORCER ACTIVE");
console.log("Scanning open proposals against Elastic Clock time fields...");
console.log("=============================================================");

function logFinalization(action, details) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] TERMINAL_AUTOMATION: ${action} | DETAILS: ${JSON.stringify(details)}\n`;
    fs.appendFileSync(LOG_FILE, entry);
    console.log(entry.trim());
}

function enforceDeadlines() {
    if (!fs.existsSync(DB_FILE)) {
        console.error("[CRITICAL ERROR] Target cadence_ledger.json not found on disk.");
        return;
    }

    try {
        const rawData = fs.readFileSync(DB_FILE, 'utf8');
        let databaseState = JSON.parse(rawData);
        const currentTime = Date.now();
        let modificationsMade = false;

        Object.keys(databaseState.proposals).forEach(id => {
            const prop = databaseState.proposals[id];

            if (currentTime >= prop.closing_at && prop.status !== 'FINALIZED') {
                console.log(`[DEADLINE EXPIRED] Lock threshold reached for Matter ID: #${prop.id}`);

                const totalVotes = prop.votes_pro + prop.votes_con;
                let outcome = 'REJECTED';

                if (totalVotes > 0 && prop.votes_pro > prop.votes_con) {
                    outcome = 'PASSED';
                } else if (totalVotes === 0) {
                    outcome = 'DISMISSED_ZERO_PARTICIPATION';
                }

                const tallySummaryString = `${prop.id}_PRO:${prop.votes_pro}_CON:${prop.votes_con}_VOTERS:${prop.voters.length}`;
                const databaseSealedHash = crypto.createHash('sha256').update(tallySummaryString).digest('hex');

                prop.status = 'FINALIZED';
                prop.final_outcome = outcome;
                prop.cryptographic_seal_hash = databaseSealedHash;

                delete prop.voters_temporary_cache;

                modificationsMade = true;

                logFinalization('MATTER_LOCKED_AND_SEALED', {
                    matter_id: prop.id,
                    final_tally_pro: prop.votes_pro,
                    final_tally_con: prop.votes_con,
                    net_result: outcome,
                    integrity_seal: databaseSealedHash
                });
            }
        });

        if (modificationsMade) {
            fs.writeFileSync(DB_FILE, JSON.stringify(databaseState, null, 2));
            console.log("[LEDGER OVERWRITE] Local database locked down and updated successfully.");
        } else {
            console.log("[SCAN COMPLETE] No expired milestones found. System state stable.");
        }

    } catch (error) {
        console.error(`[AUTOMATION EXCEPTION] Execution loop error: ${error.message}`);
    }
}

enforceDeadlines();
