import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, "../../web/src/contracts");
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

        for (const tx of transactions) {
            if (tx.transactionType === 'CREATE' && tx.contractName === 'CarbonCredit') {
                ccAddress = tx.contractAddress;
            } else if (tx.transactionType === 'CREATE' && tx.contractName === 'CarbonMarketplace') {
                cmAddress = tx.contractAddress;
            }
        }

        if (ccAddress && cmAddress) {
            const addresses = {
                CarbonCredit: ccAddress,
                CarbonMarketplace: cmAddress
            };
            fs.writeFileSync(
                path.join(frontendPath, "addresses.json"),
                JSON.stringify(addresses, null, 2)
            );
            console.log("Exported new deployed addresses.");
        } else {
            console.warn("Could not find both contract addresses in broadcast/run-latest.json");
        }
    } else {
        console.warn(`Broadcast file not found at ${broadcastPath}. Run forge script first.`);
    }

    // 2. Export ABIs
    const ccArtifactPath = path.join(__dirname, "../out/CarbonCredit.sol/CarbonCredit.json");
    const cmArtifactPath = path.join(__dirname, "../out/CarbonMarketplace.sol/CarbonMarketplace.json");

    if (fs.existsSync(ccArtifactPath) && fs.existsSync(cmArtifactPath)) {
        const ccArtifact = JSON.parse(fs.readFileSync(ccArtifactPath, 'utf8'));
        const cmArtifact = JSON.parse(fs.readFileSync(cmArtifactPath, 'utf8'));

        // We structure it like Hardhat export format (just an obj with abi array).
        const ccABI = { abi: ccArtifact.abi };
        const cmABI = { abi: cmArtifact.abi };

        fs.writeFileSync(path.join(frontendPath, "CarbonCredit.json"), JSON.stringify(ccABI, null, 2));
        fs.writeFileSync(path.join(frontendPath, "CarbonMarketplace.json"), JSON.stringify(cmABI, null, 2));

        console.log("Exported ABIs successfully.");
    } else {
        console.error("Artifacts not found. Please run 'forge build' first.");
    }

} catch (e) {
    console.error("Error exporting ABIs:", e);
}
