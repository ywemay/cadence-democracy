/**
 * CADENCE DEMOCRACY PROTOCOL - ENGINE CORE v1.0.0
 * Run locally: node server.js
 * Architecture: Zero-dependencies, Open-Runtime, Flat text-logging.
 */
const http = require('http');const fs = require('fs');const path = require('path');const crypto = require('crypto');const readline = require('readline');
// System Configurations
const PORT = 8080;const DB_FILE = path.join(__dirname, '..', 'cadence_ledger.json');const LOG_FILE = path.join(__dirname, '..', 'public_runtime.log');
// Structural Mock Database (Flat-File JSON database for low-overhead barn deployment)
let db = {
    electorate: {}, // Schema: { user_id: { key_hash, recovery_pwd, status, spent_recovery_cycle } }
    proposals: {
        "101": {
            id: 101,
            text: "Re-structure Regional Agriculture Water Pipelines to bypass industrial commercial farms.",
            created_at: Date.now(),
            closing_at: Date.now() + 14 * 60 * 60 * 1000, // 14 hours initial (Daily Mode)
            votes_pro: 0,
            votes_con: 0,
            voters: []
        }
    }
};
// 1. HELPER: Public Runtime Live Log Stream Generator
function writeToPublicLog(action, details) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ACTION: ${action} | DETAILS: ${JSON.stringify(details)}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    console.log(logEntry.trim()); // Broadcasts live to terminal standard output
}
// 2. INITIALIZATION: Seed 10 Mock Local Users for Testing Environment
function bootstrapDatabase() {
    if (fs.existsSync(DB_FILE)) {
        db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        return;
    }
    
    const mockUsers = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa'];
    mockUsers.forEach((user, index) => {
        // Generate a predictable mock hash for testing purposes
        const dummyCombinedKeys = `key1_${user}key2_${user}key3_${user}key4_${user}key5_${user}`;
        const key_hash = crypto.createHash('sha256').update(dummyCombinedKeys).digest('hex');
        const recovery_pwd = crypto.createHash('sha256').update(`pwd_${user}`).digest('hex');
        
        db.electorate[user] = {
            user_id: user,
            key_hash: key_hash,
            recovery_pwd: recovery_pwd,
            status: 'ACTIVE',
            spent_recovery_cycle: false
        };
    });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    writeToPublicLog('SYSTEM_BOOTSTRAP', { message: "10 human users registered via physical lottery simulation." });
}
// 3. CORE LOGIC ENGINE: Elastic Clock Calculation
function calculateElasticClock(proposalId) {
    const prop = db.proposals[proposalId];
    const totalElectorate = Object.keys(db.electorate).length;
    const totalVotes = prop.votes_pro +  prop.votes_con;
    const participationRate = totalVotes / totalElectorate;

    const baseWindow = 24 * 60 * 60 * 1000; // 24 Hours
    let dynamicWindow = baseWindow;

    // Apply Elastic Clock mathematical thresholds
    if (participationRate >= 0.10) {
        dynamicWindow = 14 * 24 * 60 * 60 * 1000; // 14 Days
    } else if (participationRate >= 0.01) {
        dynamicWindow = 7 * 24 * 60 * 60 * 1000; // 7 Days
    }

    prop.closing_at = prop.created_at + dynamicWindow;
    writeToPublicLog('ELASTIC_CLOCK_RECALCULATION', { 
        proposal_id: proposalId, 
        participation: `${(participationRate * 100).toFixed(2)}%`,
        new_closing: new Date(prop.closing_at).toISOString()
    });
}
// 4. HTTP SERVER ROUTING ENGINE
const server = http.createServer((req, res) => {
    // Serve Frontend Static UI
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
        return;
    }

    // API Endpoint: Serve live, unencrypted data pipeline for public transparency
    if (req.method === 'GET' && req.url === '/api/state') {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ proposals: db.proposals }));
        return;
    }

    // API Endpoint: Network topology
    if (req.method === 'GET' && req.url === '/api/network/topology') {
        try {
            const CONFIG_PATH = path.join(__dirname, 'known-barns.json');
            if (!fs.existsSync(CONFIG_PATH)) {
                res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ error: "Network profile file mapping missing on disk." }));
                return true;
            }
            const rawData = fs.readFileSync(CONFIG_PATH, 'utf8');
            const networkState = JSON.parse(rawData);
            let activePeersCount = 0;
            let quarantinedPeersCount = 0;
            networkState.network_peers.forEach(peer => {
                if (peer.status === 'ONLINE') activePeersCount++;
                if (peer.status === 'QUARANTINED') quarantinedPeersCount++;
            });
            const payloadResponse = {
                timestamp: new Date().toISOString(),
                network_health_percentage: (activePeersCount / (activePeersCount + quarantinedPeersCount) * 100).toFixed(1) + '%',
                grid_metrics: {
                    total_active_connections: activePeersCount,
                    total_quarantined_nodes: quarantinedPeersCount
                },
                topology: networkState
            };
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(payloadResponse, null, 2));
        } catch (error) {
            console.error(`[CRITICAL API ERROR] Topology data read failure: ${error.message}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Internal processing crash while extracting network data mapping loops." }));
        }
        return;
    }

    // API Endpoint: Process incoming Multi-Part Password votes
    if (req.method === 'POST' && req.url === '/api/vote') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const data = JSON.parse(body);
            const { user_id, keys, proposal_id, vote_type } = data; // keys array expected [k1, k2, k3, k4, k5]

            const user = db.electorate[user_id];
            if (!user || user.status !== 'ACTIVE') {
                res.writeHead(403); return res.end(JSON.stringify({ error: "User unauthorized or frozen." }));
            }

            // Verify the keys composite match against the server ledger record
            const inputHash = crypto.createHash('sha256').update(keys.join('')).digest('hex');
            if (inputHash !== user.key_hash) {
                res.writeHead(401); return res.end(JSON.stringify({ error: "Invalid physical key combination." }));
            }

            const prop = db.proposals[proposal_id];
            if (Date.now() > prop.closing_at) {
                res.writeHead(400); return res.end(JSON.stringify({ error: "Voting timeline has closed." }));
            }
            if (prop.voters.includes(user_id)) {
                res.writeHead(400); return res.end(JSON.stringify({ error: "Identity string has already voted on this matter." }));
            }

            // Register unencrypted vote metrics directly out in the open
            if (vote_type === 'PRO') prop.votes_pro++;
            else prop.votes_con++;
            prop.voters.push(user_id);

            calculateElasticClock(proposal_id);
            fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

            writeToPublicLog('VOTE_RECORDED', { user_id, proposal_id, vote_type });
            res.writeHead(200); res.end(JSON.stringify({ success: true }));
        });
        return;
    }

    // API Endpoint: Emergency Account Freeze Protocol
    if (req.method === 'POST' && req.url === '/api/freeze') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const { user_id, password } = JSON.parse(body);
            const user = db.electorate[user_id];

            const inputPwdHash = crypto.createHash('sha256').update(password).digest('hex');
            if (!user || inputPwdHash !== user.recovery_pwd) {
                res.writeHead(401); return res.end(JSON.stringify({ error: "Authentication match failure." }));
            }

            user.status = 'FROZEN';
            fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
            writeToPublicLog('ACCOUNT_PANIC_FREEZE', { user_id, alert: "All physical keys explicitly bricked." });
            res.writeHead(200); res.end(JSON.stringify({ frozen: true }));
        });
        return;
    }

    // API Endpoint: 6-Neighbor Social Recovery Interface Route
    if (req.method === 'POST' && req.url === '/api/recover') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const { target_user_id, witnesses } = JSON.parse(body); // witnesses format: [{user_id, single_key}]

            if (witnesses.length !== 6) {
                res.writeHead(400); return res.end(JSON.stringify({ error: "Requires exactly 6 local community witnesses." }));
            }

            // Validate each neighbor string configuration and trace cycle consumption rules
            let validityCheck = true;
            witnesses.forEach(w => {
                const witnessUser = db.electorate[w.user_id];
                if (!witnessUser || witnessUser.status !== 'ACTIVE' || witnessUser.spent_recovery_cycle === true) {
                    validityCheck = false;
                }
            });

            if (!validityCheck) {
                res.writeHead(403); return res.end(JSON.stringify({ error: "Witness identity invalid, frozen, or signature token spent this cycle." }));
            }

            // Finalizing execution parameters: Burn witness single use capabilities and issue new credentials
            witnesses.forEach(w => db.electorate[w.user_id].spent_recovery_cycle = true);
            
            // Generate a fresh, unencrypted random 5-key sequence array output
            const freshKeys = Array.from({length: 5}, () => crypto.randomBytes(8).toString('hex'));
            db.electorate[target_user_id].key_hash = crypto.createHash('sha256').update(freshKeys.join('')).digest('hex');
            db.electorate[target_user_id].status = 'ACTIVE';

            fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
            writeToPublicLog('IDENTITY_REGENERATED_VIA_SOCIAL_RECOVERY', { target_user_id, witnesses: witnesses.map(w => w.user_id) });
            
            res.writeHead(200); res.end(JSON.stringify({ success: true, print_keys: freshKeys }));
        });
        return;
    }

    res.writeHead(404); res.end();
});
// Run Core Network Initialization
bootstrapDatabase();
server.listen(PORT, () => {
    console.log(`=============================================================`);
    console.log(`CADENCE DEMOCRACY CORE LOGIC NODE ONLINE`);
    console.log(`Local Access Point: http://localhost:${PORT}`);
    console.log(`Live Observable Public Log Pipeline Running in Terminal View...`);
    console.log(`=============================================================`);
});
