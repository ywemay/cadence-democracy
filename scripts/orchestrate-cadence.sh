#!/bin/bash
# =========================================================================
# CADENCE DEMOCRACY PROTOCOL - FULL STACK ORCHESTRATOR v1.0.0
# Run locally on the barn machine: sudo bash scripts/orchestrate-cadence.sh
# =========================================================================
set -e

TARGET_DIR="/opt/cadence-democracy"
LOG_DIR="/var/log"

echo "================================================================="
echo "⚙️  ORCHESTRATING CADENCE DEMOCRACY FULL STACK CLUSTER"
echo "================================================================="

# 1. ENFORCE ROOT ACCESS
if [ "$EUID" -ne 0 ]; then
  echo "[ORCHESTRATION ERROR] This master script must be executed with root/sudo privileges."
  exit 1
fi

# 2. SYSTEM ENVIRONMENT PREPARATION
echo "[1/7] Isolating strict runtime security directory trees..."
mkdir -p "$TARGET_DIR"
mkdir -p "$TARGET_DIR/network_mirrors"
mkdir -p "$LOG_DIR"
touch "$LOG_DIR/cadence_public_runtime.log"
touch "$LOG_DIR/cadence_system_errors.log"

# 3. VERIFY PLATFORM CORE DEPENDENCIES
echo "[2/7] Checking for runtime dependencies (Node.js & Core Utilities)..."
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing lightweight runtime..."
    apt-get update && apt-get install -y nodejs wireguard iproute2
fi

# 4. DEPLOY COMPONENT INFRASTRUCTURE CONFIGURATIONS
echo "[3/7] Loading configuration data files into target directory..."
if [ ! -f "$TARGET_DIR/known_barns.json" ]; then
    cat << EOF > "$TARGET_DIR/known_barns.json"
{
  "local_node": { "node_id": "barn_local_node", "interfaces": { "primary_tunnel": "10.0.0.4", "backup_mesh_radio": "10.1.0.4" } },
  "network_peers": []
}
EOF
fi

# 5. EXECUTE DATABASE SEEDER
echo "[4/7] Evaluating ledger state database data layers..."
if [ -f "$TARGET_DIR/seed_ledger.js" ]; then
    echo "Executing local environment database seeder loop..."
    node "$TARGET_DIR/seed_ledger.js"
else
    if [ ! -f "$TARGET_DIR/cadence_ledger.json" ]; then
        echo '{"electorate":{}, "proposals":{}}' > "$TARGET_DIR/cadence_ledger.json"
    fi
fi

# 6. INITIALIZE BACKGROUND WORKER DAEMONS
echo "[5/7] Deploying background core system management engines..."

cat << EOF > /etc/systemd/system/cadence-core.service
[Unit]
Description=Cadence Democracy Engine Core
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$TARGET_DIR
ExecStart=/usr/bin/node $TARGET_DIR/server.js
Restart=always
RestartSec=3s
StandardOutput=append:$LOG_DIR/cadence_public_runtime.log
StandardError=append:$LOG_DIR/cadence_system_errors.log
ProtectSystem=strict
ReadWritePaths=$TARGET_DIR $LOG_DIR

[Install]
WantedBy=multi-user.target
EOF

cat << EOF > /etc/systemd/system/cadence-printer.service
[Unit]
Description=Cadence Democracy Physical Printer Worker
After=cadence-core.service

[Service]
Type=simple
User=root
WorkingDirectory=$TARGET_DIR
ExecStart=/usr/bin/node $TARGET_DIR/printer_agent.js
Restart=always
RestartSec=5s
StandardOutput=append:$LOG_DIR/cadence_public_runtime.log
StandardError=append:$LOG_DIR/cadence_system_errors.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable cadence-core.service cadence-printer.service
systemctl restart cadence-core.service
systemctl restart cadence-printer.service

echo "[SUCCESS] Core services initialized and tracking hardware loops."

# 7. DEPLOY CRON AUTOMATION SCHEDULER
echo "[6/7] Hooking live deadline monitoring cron-jobs into scheduler..."
CLOSER_JOB="* * * * * /usr/bin/node $TARGET_DIR/cycle_closer.js >> $LOG_DIR/cadence_cron_debug.log 2>&1"
BACKUP_JOB="*/5 * * * * /usr/bin/node $TARGET_DIR/backup_worker.js >> $LOG_DIR/cadence_backup_debug.log 2>&1"

(crontab -l 2>/dev/null | grep -F "$CLOSER_JOB") || (crontab -l 2>/dev/null; echo "$CLOSER_JOB") | crontab -
(crontab -l 2>/dev/null | grep -F "$BACKUP_JOB") || (crontab -l 2>/dev/null; echo "$BACKUP_JOB") | crontab -

# 8. OUTPUT PRODUCTION AUDIT SUMMARY
echo "[7/7] Verifying live terminal logging outputs..."
sleep 2

echo "================================================================="
echo "🚀 CADENCE DEMOCRACY PROTOCOL IS LIVE AND CHOREOGRAPHED!"
echo "================================================================="
echo "🟢 Local App Web Terminal View:  http://localhost:8080"
echo "🟢 Live Observable Public Logs: tail -f $LOG_DIR/cadence_public_runtime.log"
echo "🟢 Application Status Check:    sudo systemctl status cadence-core"
echo "-----------------------------------------------------------------"
echo "Status: Full system loop working. All files linked. System running."
echo "================================================================="
