import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, "../../web/src/contracts");
const backendEnvPath = path.join(__dirname, "../../backend/.env");

if (!fs.existsSync(frontendPath)) {
    fs.mkdirSync(frontendPath, { recursive: true });
}

try {
    // 1. Read Addresses from Forge Broadcast
    const chainId = 31337; // Anvil local chain
    const broadcastPath = path.join(__dirname, `../broadcast/Deploy.s.sol/${chainId}/run-latest.json`);

    if (fs.existsSync(broadcastPath)) {
        const broadcastData = JSON.parse(fs.readFileSync(broadcastPath, 'utf8'));
        const transactions = broadcastData.transactions || [];

        let ccAddress = "";
        let cmAddress = "";
        let arAddress = "";
        let crAddress = "";

        for (const tx of transactions) {
            if (tx.transactionType === 'CREATE') {
                if (tx.contractName === 'CarbonCredit') ccAddress = tx.contractAddress;
                if (tx.contractName === 'CarbonMarketplace') cmAddress = tx.contractAddress;
                if (tx.contractName === 'AuditRegistry') arAddress = tx.contractAddress;
                if (tx.contractName === 'CreditRetirement') crAddress = tx.contractAddress;
            }
        }

        if (ccAddress && cmAddress) {
            // Write to Frontend
            const addresses = {
                CarbonCredit: ccAddress,
                CarbonMarketplace: cmAddress
            };
            fs.writeFileSync(
                path.join(frontendPath, "addresses.json"),
                JSON.stringify(addresses, null, 2)
            );
            console.log("Exported new deployed addresses to frontend.");

            // Write to Backend .env
            if (fs.existsSync(backendEnvPath)) {
                let envContent = fs.readFileSync(backendEnvPath, 'utf8');

                // Replace CARBON_CREDIT_ADDRESS
                if (envContent.includes('CARBON_CREDIT_ADDRESS=')) {
                    envContent = envContent.replace(/CARBON_CREDIT_ADDRESS=.*/g, `CARBON_CREDIT_ADDRESS=${ccAddress}`);
                } else {
                    envContent += `\nCARBON_CREDIT_ADDRESS=${ccAddress}`;
                }

                // Replace CARBON_MARKETPLACE_ADDRESS
                if (envContent.includes('CARBON_MARKETPLACE_ADDRESS=')) {
                    envContent = envContent.replace(/CARBON_MARKETPLACE_ADDRESS=.*/g, `CARBON_MARKETPLACE_ADDRESS=${cmAddress}`);
                } else {
                    envContent += `\nCARBON_MARKETPLACE_ADDRESS=${cmAddress}`;
                }

                // Replace CREDIT_RETIREMENT_ADDRESS
                if (crAddress) {
                    if (envContent.includes('CREDIT_RETIREMENT_ADDRESS=')) {
                        envContent = envContent.replace(/CREDIT_RETIREMENT_ADDRESS=.*/g, `CREDIT_RETIREMENT_ADDRESS=${crAddress}`);
                    } else {
                        envContent += `\nCREDIT_RETIREMENT_ADDRESS=${crAddress}`;
                    }
                }

                // Replace AUDIT_REGISTRY_ADDRESS
                if (arAddress) {
                    if (envContent.includes('AUDIT_REGISTRY_ADDRESS=')) {
                        envContent = envContent.replace(/AUDIT_REGISTRY_ADDRESS=.*/g, `AUDIT_REGISTRY_ADDRESS=${arAddress}`);
                    } else {
                        envContent += `\nAUDIT_REGISTRY_ADDRESS=${arAddress}`;
                    }
                }

                fs.writeFileSync(backendEnvPath, envContent);
                console.log("Updated backend .env with all contract addresses.");
            }
        } else {
            console.warn("Could not find both contract addresses in broadcast/run-latest.json");
        }
    } else {
        console.warn(`Broadcast file not found at ${broadcastPath}. Run forge script first.`);
    }

    // 2. Export ABIs
    const ccArtifactPath = path.join(__dirname, "../out/CarbonCredit.sol/CarbonCredit.json");
    const cmArtifactPath = path.join(__dirname, "../out/CarbonMarketplace.sol/CarbonMarketplace.json");
    const crArtifactPath = path.join(__dirname, "../out/CreditRetirement.sol/CreditRetirement.json");
    const arArtifactPath = path.join(__dirname, "../out/AuditRegistry.sol/AuditRegistry.json");

    if (fs.existsSync(ccArtifactPath) && fs.existsSync(cmArtifactPath)) {
        const ccArtifact = JSON.parse(fs.readFileSync(ccArtifactPath, 'utf8'));
        const cmArtifact = JSON.parse(fs.readFileSync(cmArtifactPath, 'utf8'));

        const ccABI = { abi: ccArtifact.abi };
        const cmABI = { abi: cmArtifact.abi };

        fs.writeFileSync(path.join(frontendPath, "CarbonCredit.json"), JSON.stringify(ccABI, null, 2));
        fs.writeFileSync(path.join(frontendPath, "CarbonMarketplace.json"), JSON.stringify(cmABI, null, 2));

        if (fs.existsSync(crArtifactPath)) {
            const crArtifact = JSON.parse(fs.readFileSync(crArtifactPath, 'utf8'));
            fs.writeFileSync(path.join(frontendPath, "CreditRetirement.json"), JSON.stringify({ abi: crArtifact.abi }, null, 2));
        }
        if (fs.existsSync(arArtifactPath)) {
            const arArtifact = JSON.parse(fs.readFileSync(arArtifactPath, 'utf8'));
            fs.writeFileSync(path.join(frontendPath, "AuditRegistry.json"), JSON.stringify({ abi: arArtifact.abi }, null, 2));
        }

        console.log("Exported ABIs successfully.");
    } else {
        console.error("Artifacts not found. Please run 'forge build' first.");
    }

} catch (e) {
    console.error("Error exporting ABIs:", e);
}
