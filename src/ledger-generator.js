/**
 * CADENCE DEMOCRACY PROTOCOL - PUBLIC LEDGER BUILDER v1.0.0
 * Run locally on the barn machine: node src/ledger-generator.js
 * Objective: Convert raw JSON state files into static, unencrypted public HTML audit sheets.
 */
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'cadence_ledger.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'public_ledger.html');

console.log("=============================================================");
console.log("CADENCE DEMOCRACY: STATIC PUBLIC LEDGER GENERATOR ACTIVE");
console.log("Compiling unencrypted vote logs into readable audit sheets...");
console.log("=============================================================");

function compileHtmlLedger(data) {
    const timestamp = new Date().toISOString();
    let proposalsHtml = '';

    Object.keys(data.proposals).forEach(id => {
        const prop = data.proposals[id];
        const totalVotes = prop.votes_pro + prop.votes_con;
        const netRatio = totalVotes > 0 ? ((prop.votes_pro / totalVotes) * 100).toFixed(1) : 0;

        proposalsHtml += `
        <div class="ledger-card">
            <div class="card-header">
                <h3>Matter ID: #${prop.id}</h3>
                <span class="status-pill">${Date.now() > prop.closing_at ? 'CLOSED' : 'VOTING ACTIVE'}</span>
            </div>
            <p class="proposal-text">"${prop.text}"</p>
            
            <div class="stats-bar">
                <div class="stat-box"><strong>PRO (Yes) Tally:</strong> <span class="txt-green">${prop.votes_pro}</span></div>
                <div class="stat-box"><strong>CON (No) Tally:</strong> <span class="txt-red">${prop.votes_con}</span></div>
                <div class="stat-box"><strong>Total Active Weight:</strong> ${totalVotes} Votes</div>
                <div class="stat-box"><strong>Current Ratio:</strong> ${netRatio}% Approval</div>
            </div>

            <h4>Auditable Voter Signatures Tracker (Public Records Log)</h4>
            <div class="voter-log-box">
                ${prop.voters.length > 0 ? prop.voters.map(voter => `<span class="voter-tag">👤 ${voter}</span>`).join('') : '<span style="color: var(--text-muted); font-style: italic;">No verified human signatures submitted yet for this matter window.</span>'}
            </div>
        </div>
        `;
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Cadence Democracy - Glass Box Public Ledger</title>
    <style>
        :root {
            --bg: #0d1117; --card: #161b22; --border: #30363d;
            --text: #c9d1d9; --muted: #8b949e; --green: #3fb950; --red: #da3637;
        }
        body { font-family: system-ui, sans-serif; background-color: var(--bg); color: var(--text); padding: 30px; margin: 0; }
        header { border-bottom: 1px solid var(--border); padding-bottom: 20px; margin-bottom: 30px; }
        .meta-stamp { font-family: monospace; color: var(--muted); font-size: 0.85rem; margin-top: 5px; }
        .ledger-card { background-color: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 25px; margin-bottom: 25px; }
        .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 10px; }
        .status-pill { background: #21262d; border: 1px solid var(--border); font-size: 0.75rem; font-weight: bold; padding: 3px 8px; border-radius: 12px; }
        .proposal-text { font-size: 1.1rem; line-height: 1.6; margin: 20px 0; font-style: italic; color: #f0f6fc; }
        .stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; background: #090c10; padding: 15px; border-radius: 6px; border: 1px solid var(--border); }
        .stat-box { font-size: 0.9rem; }
        .txt-green { color: var(--green); font-weight: bold; }
        .txt-red { color: var(--red); font-weight: bold; }
        .voter-log-box { display: flex; flex-wrap: wrap; gap: 8px; background: #090c10; padding: 15px; border-radius: 6px; border: 1px solid var(--border); max-height: 150px; overflow-y: auto; }
        .voter-tag { font-family: monospace; font-size: 0.8rem; background: #21262d; border: 1px solid var(--border); padding: 2px 6px; border-radius: 4px; }
    </style>
</head>
<body>
    <header>
        <h1>📖 Cadence Open Ledger Sheet</h1>
        <div class="meta-stamp">Compiled Audit Generation Time: ${timestamp} Z</div>
        <div class="meta-stamp">Security Status: 100% Unencrypted Data Loop Pipeline Tracker • Verification Open to All Earthlings</div>
    </header>
    <main>
        ${proposalsHtml}
    </main>
</body>
</html>
    `;
}

function buildLedgerFile() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            console.error("[LEDGER ERROR] Cannot construct audit layout: Core cadence_ledger.json target missing.");
            return;
        }

        const rawData = fs.readFileSync(DB_FILE, 'utf8');
        const databaseState = JSON.parse(rawData);

        const completeHtmlLayout = compileHtmlLedger(databaseState);

        fs.writeFileSync(OUTPUT_FILE, completeHtmlLayout, 'utf8');
        console.log(`[LEDGER GENERATED] Static glass-box record output updated at: ${OUTPUT_FILE}`);
    } catch (err) {
        console.error(`[CRITICAL BUILD ERROR] Processing routine failure: ${err.message}`);
    }
}

fs.watch(DB_FILE, (eventType) => {
    if (eventType === 'change') {
        buildLedgerFile();
    }
});

buildLedgerFile();
