#!/bin/bash
# =========================================================================
# CADENCE DEMOCRACY PROTOCOL - AUTOMATED HARDWARE INITIALIZATION UTILITY v1.0.0
# Run locally on the barn server machine: sudo bash scripts/setup-cadence.sh
# =========================================================================
set -e

echo "================================================================="
echo "INITIALIZING CADENCE DEMOCRACY PROTOCOL DEPLOYMENT ARCHITECTURE"
echo "================================================================="

# 1. ENFORCE ROOT ACCESS
if [ "$EUID" -ne 0 ]; then
  echo "[DEPLOYMENT ERROR] This setup script must be executed with root/sudo privileges."
  exit 1
fi

# 2. PROMPT FOR PEER NETWORKING INPUTS
read -p "Enter Target User ID of Remote Neighbor Barn (e.g. root): " REMOTE_USER
read -p "Enter Static Private IP of Remote Neighbor Barn (e.g. 10.0.0.2): " REMOTE_IP

# 3. CONSTRUCT SANDBOX SYSTEM FILES
echo "[1/5] Building strict runtime security directory trees..."
TARGET_DIR="/opt/cadence-democracy"
mkdir -p "$TARGET_DIR"
mkdir -p "$TARGET_DIR/network_mirrors"
mkdir -p "/var/log"

# 4. GENERATE NON-INTERACTIVE AUTOMATION SSH KEYS
echo "[2/5] Creating offline cryptographic SSH key pairings for background workers..."
SSH_KEY_PATH="/root/.ssh/id_cadence_automation"
if [ ! -f "$SSH_KEY_PATH" ]; then
    ssh-keygen -t ed25519 -N "" -f "$SSH_KEY_PATH" -C "cadence_barn_automation_key"
    echo "[SECURITY SUCCESS] Fresh automation keys generated."
else
    echo "[SECURITY NOTICE] Pre-existing SSH automation key detected. Retaining original pairings."
fi

# 5. CONSTRUCT CONFIG FILES
echo "[3/5] Injecting background script execution credentials..."
cat << EOF > "$TARGET_DIR/known_barns.json"
{
  "local_node": { "node_id": "barn_local_node" },
  "network_peers": []
}
EOF

if [ ! -f "$TARGET_DIR/cadence_ledger.json" ]; then
    echo '{"electorate":{}, "proposals":{}}' > "$TARGET_DIR/cadence_ledger.json"
fi

# 6. ENFORCE SYSTEM REBOOT CONTROL SERVICES
echo "[4/5] Deploying system service automation templates..."
SERVICE_FILE="/etc/systemd/system/cadence-core.service"

cat << EOF > "$SERVICE_FILE"
[Unit]
Description=Cadence Democracy Engine Core
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$TARGET_DIR
ExecStart=/usr/bin/node $TARGET_DIR/server.js
Restart=always
RestartSec=5s
StandardOutput=append:/var/log/cadence_public_runtime.log
StandardError=append:/var/log/cadence_system_errors.log
ProtectSystem=strict
ReadWritePaths=$TARGET_DIR /var/log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable cadence-core.service || echo "[NOTICE] Server files missing. Service will start upon server.js placement."

# 7. CONSTRUCT CRON AUTOMATION
echo "[5/5] Hooking Elastic Clock terminal enforcer into crontab scheduler loops..."
CRON_JOB="* * * * * /usr/bin/node $TARGET_DIR/cycle_closer.js >> /var/log/cadence_cron_debug.log 2>&1"
(crontab -l 2>/dev/null | grep -F "$CRON_JOB") || (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "================================================================="
echo "DECENTRALIZED ARCHITECTURE DEPLOYMENT COMPLETE!"
echo "================================================================="
echo "👉 ACTION REQUIRED FOR PUBLIC NETWORKING SYNC:"
echo "To allow your background backup workers to copy files without passwords,"
echo "you must copy the line below and manually append it to the remote barn's"
echo "file located at: /root/.ssh/authorized_keys"
echo "-----------------------------------------------------------------"
cat "${SSH_KEY_PATH}.pub"
echo "-----------------------------------------------------------------"
echo "Once the key is transferred, run the following verification link command:"
echo "ssh -i $SSH_KEY_PATH ${REMOTE_USER}@${REMOTE_IP} 'echo Connectivity Verified'"
echo "================================================================="
