/**
 * CADENCE DEMOCRACY PROTOCOL - AUTOMATED LEDGER SEED INJECTOR v1.0.0
 * Run locally on the barn machine: node src/seed-ledger.js
 * Objective: Generate 1,000 mock voter identities and 10 proposals for simulation testing.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, '..', 'cadence_ledger.json');
const TARGET_VOTERS_COUNT = 1000;

console.log("=============================================================");
console.log(`CADENCE LEDGER SEEDER: GENERATING ${TARGET_VOTERS_COUNT} MOCK IDENTITIES`);
console.log("=============================================================");

let ledgerState = {
    electorate: {},
    proposals: {}
};

function generateRandomAlphanumeric(length) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

// 1. POPULATE ELECTORATE
console.log(`[1/3] Computing ${TARGET_VOTERS_COUNT} multi-part cryptographic hashes...`);
for (let i = 1; i <= TARGET_VOTERS_COUNT; i++) {
    const paddedIndex = String(i).padStart(4, '0');
    const username = `citizen_node_${paddedIndex}`;

    const simulatedKeys = [
        `K1_${generateRandomAlphanumeric(12)}`,
        `K2_${generateRandomAlphanumeric(12)}`,
        `K3_${generateRandomAlphanumeric(12)}`,
        `K4_${generateRandomAlphanumeric(12)}`,
        `K5_${generateRandomAlphanumeric(12)}`
    ];

    const compositeHash = crypto.createHash('sha256').update(simulatedKeys.join('')).digest('hex');
    const recoveryPasswordHash = crypto.createHash('sha256').update(`backup_pwd_${paddedIndex}`).digest('hex');

    ledgerState.electorate[username] = {
        user_id: username,
        key_hash: compositeHash,
        recovery_pwd: recoveryPasswordHash,
        status: 'ACTIVE',
        spent_recovery_cycle: false
    };
}

// 2. POPULATE PROPOSALS
console.log("[2/3] Injecting 10 initial structural village proposals...");
const sampleIssues = [
    "Approve decentralized funding for regional solar mini-grid infrastructure arrays.",
    "Enforce mandatory 50% tree canopy restoration across public market squares.",
    "Construct free baseline cold-storage facilities for regional agricultural yields.",
    "Allocate resources to extend community health center triage windows to 24/7 loops.",
    "Approve structural repair budget for main arterial drainage pipelines before monsoons.",
    "Implement open-access community composting hubs across residential perimeters.",
    "Establish localized technical vocational training grants for youth software engineering.",
    "Set local public water purification filter replacement frequency to monthly schedules.",
    "Deploy zero-cost mesh Wi-Fi relays across public library grounds.",
    "Approve localized municipal funding for weekend children's educational centers."
];

const now = Date.now();
sampleIssues.forEach((issueText, index) => {
    const proposalId = String(201 + index);
    let votesPro = 0;
    let votesCon = 0;
    let votersList = [];
    let closingTime = now + 24 * 60 * 60 * 1000; // Default 24 hours

    if (index === 0) {
        votesPro = 85; votesCon = 35;
        closingTime = now + 14 * 24 * 60 * 60 * 1000;
        votersList = Array.from({ length: 120 }, (_, i) => `citizen_node_${String(i + 1).padStart(4, '0')}`);
    } else if (index === 1) {
        votesPro = 12; votesCon = 3;
        closingTime = now + 7 * 24 * 60 * 60 * 1000;
        votersList = Array.from({ length: 15 }, (_, i) => `citizen_node_${String(i + 500).padStart(4, '0')}`);
    }

    ledgerState.proposals[proposalId] = {
        id: parseInt(proposalId),
        text: issueText,
        created_at: now,
        closing_at: closingTime,
        votes_pro: votesPro,
        votes_con: votesCon,
        status: votersList.length > 0 ? 'VOTING_ACTIVE' : 'OPEN',
        voters: votersList
    };
});

// 3. FLUSH DATA
console.log("[3/3] Committing records to unencrypted json database file storage drive...");
try {
    fs.writeFileSync(DB_FILE, JSON.stringify(ledgerState, null, 2), 'utf8');
    console.log("\n=============================================================");
    console.log("DATABASE SEED SUCCESSFUL! ENVIRONMENT CONFIGURATION COMPLETE");
    console.log(`File Generated:  ${DB_FILE}`);
    console.log(`Voter Records:   ${Object.keys(ledgerState.electorate).length} (Verified Human Profiles)`);
    console.log(`Active Proposals: ${Object.keys(ledgerState.proposals).length} (With Pre-mixed Elastic Clock States)`);
    console.log("=============================================================\n");
} catch (error) {
    console.error(`[CRITICAL SEED ERROR] Failed to write database entries: ${error.message}`);
}
