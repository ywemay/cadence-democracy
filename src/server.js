/**
 * CADENCE DEMOCRACY PROTOCOL - ENGINE CORE v1.0.0
 * Run locally: node src/server.js
 * Architecture: Zero-dependencies, Open-Runtime, Flat text-logging.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 8080;
const DB_FILE = path.join(__dirname, '..', 'cadence_ledger.json');
const LOG_FILE = path.join(__dirname, '..', 'public_runtime.log');

let db = { electorate: {}, proposals: {} };
let nextProposalId = 106;

// Plaintext keys for demo users — NEVER store this in production
const DEMO_KEYS = {};

function writeToPublicLog(action, details) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ACTION: ${action} | DETAILS: ${JSON.stringify(details)}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    console.log(logEntry.trim());
}

function migrateProposal(p) {
    // Ensure all fields exist for legacy DB entries
    if (!p.description) p.description = '';
    if (!p.proposer) p.proposer = 'unknown';
    if (!p.voters) p.voters = [];
    if (!p.created_at) p.created_at = Date.now();
    if (!p.closing_at) p.closing_at = Date.now() + 7 * 24 * 60 * 60 * 1000;
    return p;
}

function migrateElectorate(u) {
    if (u.last_proposal_at === undefined) u.last_proposal_at = 0;
    return u;
}

function bootstrapDatabase() {
    // Always populate demo keys — the formula is deterministic
    const mockUsers = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa'];
    mockUsers.forEach((user) => {
        DEMO_KEYS[user] = [
            `key1_${user}_a1b2`,
            `key2_${user}_c3d4`,
            `key3_${user}_e5f6`,
            `key4_${user}_g7h8`,
            `key5_${user}_i9j0`
        ];
    });

    if (fs.existsSync(DB_FILE)) {
        db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        // Migrate existing entries
        Object.keys(db.proposals).forEach(id => {
            db.proposals[id] = migrateProposal(db.proposals[id]);
        });
        Object.keys(db.electorate).forEach(u => {
            db.electorate[u] = migrateElectorate(db.electorate[u]);
        });
        // Find max proposal id for nextProposalId
        const ids = Object.keys(db.proposals).map(Number).filter(n => !isNaN(n));
        if (ids.length > 0) nextProposalId = Math.max(...ids) + 1;
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
        return;
    }

    mockUsers.forEach((user) => {
        const keys = DEMO_KEYS[user];
        const key_hash = crypto.createHash('sha256').update(keys.join('')).digest('hex');
        const recovery_pwd = crypto.createHash('sha256').update(`pwd_${user}`).digest('hex');

        db.electorate[user] = {
            user_id: user,
            key_hash: key_hash,
            recovery_pwd: recovery_pwd,
            status: 'ACTIVE',
            spent_recovery_cycle: false,
            last_proposal_at: 0
        };
    });

    // Seed 5 proposals
    const now = Date.now();
    const proposals = [
        {
            id: 101, proposer: 'gamma',
            text: "Re-structure Regional Agriculture Water Pipelines to bypass industrial commercial farms.",
            description: "The current pipeline network routes water through industrial zones before reaching smallholder farms, resulting in reduced flow and contamination. This proposal would build a dedicated bypass line serving 47 family-owned plots in the northern sector, with maintenance costs covered by a per-acre fee not to exceed 200 rupees monthly.",
            closingOffset: 14
        },
        {
            id: 102, proposer: 'epsilon',
            text: "Allocate community funds for a new public health clinic in the central district.",
            description: "The nearest clinic is 12 km away — inaccessible for elderly residents and those without transport. This proposal allocates 2.4 lakh rupees from the community treasury to convert the vacant municipal building on Market Road into a fully stocked clinic with a part-time nurse and weekly doctor visits.",
            closingOffset: 7
        },
        {
            id: 103, proposer: 'zeta',
            text: "Install solar-powered street lighting along the main market road.",
            description: "The 2.3 km main market road has no public lighting, creating safety hazards after dusk and limiting evening commerce. This proposal covers 42 solar LED poles with battery backup, installed by local electricians, with a projected 8-year lifespan before panel replacement.",
            closingOffset: 24
        },
        {
            id: 104, proposer: 'theta',
            text: "Establish a weekly farmers market with zero vendor fees for local producers.",
            description: "Small farmers currently sell to middlemen at 40% below market rates. A weekly direct-to-consumer market on the community center grounds would let producers keep full proceeds. The proposal includes basic stall infrastructure (tables, shade, water access) funded by a one-time grant of 80,000 rupees.",
            closingOffset: 3
        },
        {
            id: 105, proposer: 'beta',
            text: "Approve emergency road repair budget for the monsoon-damaged north bridge.",
            description: "The north bridge approach road was washed out in last month's monsoon, cutting off 23 households from the main market and school. Emergency repairs are estimated at 1.8 lakh rupees. Without action, the detour adds 45 minutes each way for daily commuters.",
            closingOffset: 1
        }
    ];
    proposals.forEach(p => {
        db.proposals[p.id] = {
            id: p.id,
            text: p.text,
            description: p.description,
            proposer: p.proposer,
            created_at: now,
            closing_at: now + p.closingOffset * 60 * 60 * 1000,
            votes_pro: 0,
            votes_con: 0,
            status: 'OPEN',
            voters: []
        };
    });

    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    writeToPublicLog('SYSTEM_BOOTSTRAP', { message: `${mockUsers.length} users, ${proposals.length} proposals registered.` });
}

function calculateElasticClock(proposalId) {
    const prop = db.proposals[proposalId];
    if (!prop) return;
    const totalElectorate = Object.keys(db.electorate).length;
    const totalVotes = prop.votes_pro + prop.votes_con;
    const participationRate = totalVotes / totalElectorate;

    let dynamicWindow = 24 * 60 * 60 * 1000;
    if (participationRate >= 0.10) dynamicWindow = 14 * 24 * 60 * 60 * 1000;
    else if (participationRate >= 0.01) dynamicWindow = 7 * 24 * 60 * 60 * 1000;

    prop.closing_at = prop.created_at + dynamicWindow;
    writeToPublicLog('ELASTIC_CLOCK_RECALCULATION', {
        proposal_id: proposalId,
        participation: `${(participationRate * 100).toFixed(2)}%`,
        new_closing: new Date(prop.closing_at).toISOString()
    });
}

function jsonResponse(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(data));
}

function serveStatic(res, filePath, contentType) {
    try {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(fs.readFileSync(filePath));
    } catch {
        res.writeHead(404);
        res.end();
    }
}

function parseBody(req, cb) {
    let body = '';
    req.on('data', c => body += c.toString());
    req.on('end', () => {
        try { cb(JSON.parse(body)); }
        catch { cb(null); }
    });
}

bootstrapDatabase();

const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    // Static HTML pages
    if (method === 'GET' && (url === '/' || url === '/index.html'))
        return serveStatic(res, path.join(__dirname, 'index.html'), 'text/html');
    if (method === 'GET' && url === '/network-map.html')
        return serveStatic(res, path.join(__dirname, 'network-map.html'), 'text/html');
    if (method === 'GET' && url === '/notifications.html')
        return serveStatic(res, path.join(__dirname, 'notifications.html'), 'text/html');
    if (method === 'GET' && url === '/recovery.html')
        return serveStatic(res, path.join(__dirname, 'recovery.html'), 'text/html');

    // API: Full state (proposals + electorate info)
    if (method === 'GET' && url === '/api/state') {
        const totalElectorate = Object.keys(db.electorate).length;
        const activeVoters = Object.values(db.electorate).filter(u => u.status === 'ACTIVE').length;
        return jsonResponse(res, 200, {
            proposals: db.proposals,
            electorate: { total: totalElectorate, active: activeVoters }
        });
    }

    // API: Demo keys — returns plaintext keys for all bootstrap users
    if (method === 'GET' && url === '/api/demo/keys') {
        return jsonResponse(res, 200, { keys: DEMO_KEYS });
    }

    // API: Network topology
    if (method === 'GET' && url === '/api/network/topology') {
        try {
            const CONFIG_PATH = path.join(__dirname, 'known-barns.json');
            if (!fs.existsSync(CONFIG_PATH))
                return jsonResponse(res, 404, { error: "Network config not found." });
            const networkState = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
            const active = networkState.network_peers.filter(p => p.status === 'ONLINE').length;
            const quarantined = networkState.network_peers.filter(p => p.status === 'QUARANTINED').length;
            return jsonResponse(res, 200, {
                timestamp: new Date().toISOString(),
                health: active + quarantined > 0 ? ((active / (active + quarantined)) * 100).toFixed(1) + '%' : 'N/A',
                metrics: { active, quarantined },
                topology: networkState
            });
        } catch (e) {
            return jsonResponse(res, 500, { error: e.message });
        }
    }

    // API: Vote
    if (method === 'POST' && url === '/api/vote') {
        return parseBody(req, data => {
            if (!data) return jsonResponse(res, 400, { error: 'Invalid JSON' });
            const { user_id, keys, proposal_id, vote_type } = data;
            const user = db.electorate[user_id];
            if (!user || user.status !== 'ACTIVE')
                return jsonResponse(res, 403, { error: 'User not found or frozen.' });
            const inputHash = crypto.createHash('sha256').update(keys.join('')).digest('hex');
            if (inputHash !== user.key_hash)
                return jsonResponse(res, 401, { error: 'Invalid key combination.' });
            const prop = db.proposals[proposal_id];
            if (!prop) return jsonResponse(res, 404, { error: 'Proposal not found.' });
            if (Date.now() > prop.closing_at)
                return jsonResponse(res, 400, { error: 'Voting period has closed.' });
            if (prop.voters.includes(user_id))
                return jsonResponse(res, 400, { error: 'Already voted on this matter.' });
            if (vote_type === 'PRO') prop.votes_pro++;
            else prop.votes_con++;
            prop.voters.push(user_id);
            calculateElasticClock(proposal_id);
            fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
            writeToPublicLog('VOTE_RECORDED', { user_id, proposal_id, vote_type });
            return jsonResponse(res, 200, { success: true });
        });
    }

    // API: Create proposal (1 per user per week)
    if (method === 'POST' && url === '/api/proposals') {
        return parseBody(req, data => {
            if (!data) return jsonResponse(res, 400, { error: 'Invalid JSON' });
            const { user_id, keys, text, description } = data;
            if (!text || !text.trim())
                return jsonResponse(res, 400, { error: 'Proposal text is required.' });

            const user = db.electorate[user_id];
            if (!user || user.status !== 'ACTIVE')
                return jsonResponse(res, 403, { error: 'User not found or frozen.' });
            const inputHash = crypto.createHash('sha256').update(keys.join('')).digest('hex');
            if (inputHash !== user.key_hash)
                return jsonResponse(res, 401, { error: 'Invalid key combination.' });

            // Rate limit: 1 proposal per 7 days per user
            const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
            if (user.last_proposal_at > 0 && (Date.now() - user.last_proposal_at) < oneWeekMs) {
                const daysLeft = Math.ceil((oneWeekMs - (Date.now() - user.last_proposal_at)) / (24 * 60 * 60 * 1000));
                return jsonResponse(res, 429, { error: `You can submit one proposal per week. ${daysLeft} day(s) remaining.` });
            }

            const now = Date.now();
            const id = nextProposalId++;
            db.proposals[id] = {
                id,
                text: text.trim(),
                description: (description || '').trim(),
                proposer: user_id,
                created_at: now,
                closing_at: now + 7 * 24 * 60 * 60 * 1000,  // default 7-day window
                votes_pro: 0,
                votes_con: 0,
                status: 'OPEN',
                voters: []
            };
            user.last_proposal_at = now;

            fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
            writeToPublicLog('PROPOSAL_CREATED', { id, proposer: user_id, text: text.trim() });
            return jsonResponse(res, 200, { success: true, proposal: db.proposals[id] });
        });
    }

    // API: Freeze
    if (method === 'POST' && url === '/api/freeze') {
        return parseBody(req, data => {
            if (!data) return jsonResponse(res, 400, { error: 'Invalid JSON' });
            const { user_id, password } = data;
            const user = db.electorate[user_id];
            const inputHash = crypto.createHash('sha256').update(password).digest('hex');
            if (!user || inputHash !== user.recovery_pwd)
                return jsonResponse(res, 401, { error: 'Auth failed.' });
            user.status = 'FROZEN';
            fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
            writeToPublicLog('ACCOUNT_FREEZE', { user_id });
            return jsonResponse(res, 200, { frozen: true });
        });
    }

    // API: Social recovery
    if (method === 'POST' && url === '/api/recover') {
        return parseBody(req, data => {
            if (!data) return jsonResponse(res, 400, { error: 'Invalid JSON' });
            const { target_user_id, witnesses } = data;
            if (!witnesses || witnesses.length !== 6)
                return jsonResponse(res, 400, { error: 'Requires exactly 6 witnesses.' });
            let valid = true;
            witnesses.forEach(w => {
                const u = db.electorate[w.user_id];
                if (!u || u.status !== 'ACTIVE' || u.spent_recovery_cycle) valid = false;
            });
            if (!valid) return jsonResponse(res, 403, { error: 'One or more witnesses invalid or spent.' });
            witnesses.forEach(w => db.electorate[w.user_id].spent_recovery_cycle = true);
            const freshKeys = Array.from({ length: 5 }, () => crypto.randomBytes(8).toString('hex'));
            db.electorate[target_user_id].key_hash = crypto.createHash('sha256').update(freshKeys.join('')).digest('hex');
            db.electorate[target_user_id].status = 'ACTIVE';
            fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
            writeToPublicLog('IDENTITY_RECOVERED', { target_user_id, witnesses: witnesses.map(w => w.user_id) });
            return jsonResponse(res, 200, { success: true, print_keys: freshKeys });
        });
    }

    res.writeHead(404);
    res.end();
});

server.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('CADENCE DEMOCRACY CORE LOGIC NODE ONLINE');
    console.log(`  http://localhost:${PORT}`);
    console.log(`  Demo users: alpha, beta, gamma, delta, epsilon, zeta, eta, theta, iota, kappa`);
    console.log(`  For each user, keys are: key1_{user}_a1b2, key2_{user}_c3d4, etc.`);
    console.log('='.repeat(60));
});
