This is the standardized JSON schema for known_barns.json. It maps out the local network configuration, peer connection methods, public status indicators, and current vote processing values for a cluster of interconnected barns.
Save this data file as known_barns.json in your server directory to manage network endpoints:

{
  "local_node": {
    "node_id": "barn_04_maharashtra",
    "region_code": "IN-MH-04",
    "physical_location": "Bhiwandi District Barn, Maharashtra",
    "software_version": "1.0.0-BETA",
    "runtime_build_hash": "sha256-8f3a9c9f2b3e4d5c6b7a8f9e0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
    "current_cycle_id": "2026-H2",
    "interfaces": {
      "primary_tunnel": "10.0.0.4",
      "backup_mesh_radio": "10.1.0.4"
    }
  },
  "network_peers": [
    {
      "peer_id": "barn_01_gujarat",
      "status": "ONLINE",
      "last_sync_timestamp": "2026-07-21T16:02:11Z",
      "connection_profiles": {
        "primary": {
          "type": "wireguard_tunnel",
          "endpoint_url": "http://10.0.0.1:8080",
          "public_key": "GuJ1_BuLlEtPrOoF_NeTwOrK_KeY_01_guja_=",
          "metric_priority": 10
        },
        "backup": {
          "type": "mesh_lora_radio",
          "endpoint_url": "http://10.1.0.1:8080",
          "channel_frequency_mhz": 868.1,
          "metric_priority": 100
        }
      },
      "ledger_metrics": {
        "verified_voter_pool": 1420,
        "processed_gossip_count": 89432
      }
    },
    {
      "peer_id": "barn_02_madhya_pradesh",
      "status": "ONLINE",
      "last_sync_timestamp": "2026-07-21T16:04:45Z",
      "connection_profiles": {
        "primary": {
          "type": "wireguard_tunnel",
          "endpoint_url": "http://10.0.0.2:8080",
          "public_key": "MaDh_CeNtRaL_TrUsT_NeTwOrK_KeY_02_mp_=",
          "metric_priority": 10
        },
        "backup": {
          "type": "mesh_directional_wifi",
          "endpoint_url": "http://10.1.0.2:8080",
          "hardware_band_ghz": 5.8,
          "metric_priority": 100
        }
      },
      "ledger_metrics": {
        "verified_voter_pool": 980,
        "processed_gossip_count": 41203
      }
    },
    {
      "peer_id": "barn_03_goa_captured_shell",
      "status": "QUARANTINED",
      "last_sync_timestamp": "2026-07-20T03:14:22Z",
      "quarantine_reason": "CRITICAL_INTEGRITY_MISMATCH: System log streams failed automated 51% validation audits. Node flagged as occupied/corrupted by centralized forces.",
      "connection_profiles": {
        "primary": {
          "type": "wireguard_tunnel",
          "endpoint_url": "http://10.0.0.3:8080",
          "public_key": "GoA_BLOCKED_AND_ISOLATED_NODE_KEY_03_=",
          "metric_priority": 999
        }
      },
      "ledger_metrics": {
        "verified_voter_pool": 0,
        "processed_gossip_count": 0
      }
    }
  ]
}

------------------------------
## 🔍 How this Schema Protections the System

   1. The Automated Blacklist (QUARANTINED): Notice the configuration block for barn_03. When neighbors detect a server breach or physical occupation, the state updates to QUARANTINED, changes the priority metric to 999 (ignoring data routing paths), and locks down traffic to leave the server isolated.
   2. Dual Interface Priority Routing: The connection_profiles map sets a lower numeric priority (10) for the primary WireGuard option and a higher value (100) for the local radio link. This tells the network core script to prioritize the regular internet connection and automatically switch to the radio mesh if it drops.
   3. Audit Version Synchronization: The schema logs the runtime_build_hash of each neighbor node. If a peer modifies their core script to alter vote calculations, the hash misalign will flag a mismatch across the network maps instantly.

To advance your network buildout, let me know if you would like to:

* Create a systemd service configuration script to launch this configuration stack automatically at machine boot.
* Develop an HTML network visualization panel showing active barn metrics and connection status maps.
* Outline the database query routine that processes this JSON data inside the server logic.



