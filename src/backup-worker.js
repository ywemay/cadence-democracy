/**
 * CADENCE DEMOCRACY PROTOCOL - DECENTRALIZED BACKUP WORKER v1.0.0
 * Run locally on the barn machine: node src/backup-worker.js
 * Objective: High-velocity local storage replication and offsite peer mirroring.
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const DB_FILE = path.join(__dirname, '..', 'cadence_ledger.json');
const SOURCE_LEDGER = DB_FILE;
const SOURCE_HTML = path.join(__dirname, '..', 'public_ledger.html');
const LOCAL_USB_DIR = '/media/usb_backup_vault/';
const REMOTE_PEER_TARGET = 'root@10.0.0.2:/opt/cadence-democracy/network_mirrors/barn_04/';
const SYNC_INTERVAL_MS = 5 * 60 * 1000;

console.log("=============================================================");
console.log("CADENCE DEMOCRACY: DECENTRALIZED BACKUP AGENT ACTIVE");
console.log(`Replication Loop Timer Initialized: Every ${SYNC_INTERVAL_MS / 60000} Minutes`);
console.log("=============================================================");

function backupToLocalUSB() {
    if (!fs.existsSync(LOCAL_USB_DIR)) {
        console.warn(`[BACKUP WARN] Local physical USB Vault not detected at ${LOCAL_USB_DIR}. Check drive connection.`);
        return;
    }

    try {
        const timestamp = Date.now();
        fs.copyFileSync(SOURCE_LEDGER, path.join(LOCAL_USB_DIR, `ledger_snapshot_${timestamp}.json`));
        fs.copyFileSync(SOURCE_HTML, path.join(LOCAL_USB_DIR, 'latest_public_ledger.html'));
        console.log(`[STORAGE SUCCESS] Core state mirrored locally to physical USB hardware block.`);
    } catch (error) {
        console.error(`[STORAGE ERROR] Failed local hardware duplication process: ${error.message}`);
    }
}

function mirrorToRemotePeer() {
    const scpCommand = `scp "${SOURCE_LEDGER}" "${SOURCE_HTML}" ${REMOTE_PEER_TARGET}`;

    exec(scpCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`[OFFSITE SYNC ERROR] Remote network mirror pipeline delivery failed: ${error.message}`);
            return;
        }
        console.log(`[OFFSITE SYNC SUCCESS] State data successfully replicated to safe neighbor node.`);
    });
}

function executeBackupCycle() {
    if (!fs.existsSync(SOURCE_LEDGER)) {
        console.error("[BACKUP ERROR] Core file cadence_ledger.json missing. Aborting replication sequence.");
        return;
    }

    console.log(`\n[STARTING SNAPSHOT CYCLE] Triggering automated dual-layer sync at: ${new Date().toISOString()}`);
    backupToLocalUSB();
    mirrorToRemotePeer();
}

executeBackupCycle();
setInterval(executeBackupCycle, SYNC_INTERVAL_MS);
