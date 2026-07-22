/**
 * CADENCE DEMOCRACY PROTOCOL - PHYSICAL PRINTER AGENT v1.0.0
 * Run locally on the barn machine: node src/printer-agent.js
 * Objective: Secure local loop printout. Zero network exposure.
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const DB_FILE = path.join(__dirname, '..', 'cadence_ledger.json');
const TEMP_TICKET = path.join(__dirname, '..', 'pending_ticket.txt');

console.log("=============================================================");
console.log("CADENCE DEMOCRACY: PHYSICAL PRINTER AGENT ACTIVE");
console.log("Listening for identity generation events via local file loop...");
console.log("=============================================================");

function sendToPhysicalHardware(filePath) {
    const printCommand = process.platform === 'win32'
        ? `notepad /p "${filePath}"`
        : `lp -d Local_Barn_Receipt_Printer "${filePath}"`;

    exec(printCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`[PRINTER ERROR] Failed to communicate with USB hardware: ${error.message}`);
            return;
        }
        console.log(`[PRINTER SUCCESS] Ticket successfully pushed to hardware buffer spool.`);

        // Secure overwrite and delete the temporary text file
        fs.writeFileSync(filePath, '000000000000000000000000000000000000000000000000');
        fs.unlinkSync(filePath);
        console.log(`[SECURITY PURGE] Temporary local digital cache shredded from disk.`);
    });
}

function formatPhysicalTicket(userId, keysArray) {
    const timestamp = new Date().toLocaleString();
    return `
=========================================
        CADENCE DEMOCRACY NETWORK        
   REGIONAL BARN NODE IDENTITY TICKET   
=========================================
Timestamp: ${timestamp}
User ID:   ${userId}
Status:    VERIFIED HUMAN

-----------------------------------------
SECURITY NOTICE:
These 5 keys act as a single multi-part
password. Store this paper safely offline. 
If lost, you must gather 6 neighbors to 
re-verify your physical identity.
-----------------------------------------

KEY 1: [ ${keysArray[0]} ]

KEY 2: [ ${keysArray[1]} ]

KEY 3: [ ${keysArray[2]} ]

KEY 4: [ ${keysArray[3]} ]

KEY 5: [ ${keysArray[4]} ]

=========================================
   PHYSICAL CONSENSUS • SHRED AFTER LOSS   
=========================================
`;
}

// Watch the local flat JSON database for modifications
fs.watch(DB_FILE, (eventType, filename) => {
    if (eventType === 'change') {
        try {
            const currentData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

            Object.keys(currentData.electorate).forEach(userId => {
                const user = currentData.electorate[userId];

                if (user.pending_print_keys && user.pending_print_keys.length === 5) {
                    console.log(`[EVENT DETECTED] Generating physical layout for User: ${userId}`);

                    const ticketContent = formatPhysicalTicket(userId, user.pending_print_keys);
                    fs.writeFileSync(TEMP_TICKET, ticketContent, 'utf8');
                    sendToPhysicalHardware(TEMP_TICKET);

                    delete user.pending_print_keys;
                    fs.writeFileSync(DB_FILE, JSON.stringify(currentData, null, 2));
                }
            });
        } catch (err) {
            // Suppress intermediate parsing conflicts during hot-reload file writing
        }
    }
});
