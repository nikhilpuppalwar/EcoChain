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
    // Read from hardhat ignition deployment output
    const deploymentPath = path.join(__dirname, "../ignition/deployments/chain-31337/deployed_addresses.json");
    if (fs.existsSync(deploymentPath)) {
        const deployed = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
        
        const ccAddress = deployed["EcoChainModule#CarbonCredit"];
        const cmAddress = deployed["EcoChainModule#CarbonMarketplace"];
        
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
            
            // Also write to backend env
            const backendEnvPath = path.join(__dirname, "../../backend/.env");
            if (fs.existsSync(backendEnvPath)) {
                let envContent = fs.readFileSync(backendEnvPath, "utf8");
                envContent = envContent.replace(/CARBON_CREDIT_ADDRESS=0x[a-fA-F0-9]+/, `CARBON_CREDIT_ADDRESS=${ccAddress}`);
                fs.writeFileSync(backendEnvPath, envContent);
                console.log("Updated backend/.env with new token address");
            }
        }
    } else {
        console.warn(`Deployed addresses not found at ${deploymentPath}`);
    }

    // Export ABIs
    const ccArtifactPath = path.join(__dirname, "../artifacts/src/CarbonCredit.sol/CarbonCredit.json");
    const cmArtifactPath = path.join(__dirname, "../artifacts/src/CarbonMarketplace.sol/CarbonMarketplace.json");

    if (fs.existsSync(ccArtifactPath) && fs.existsSync(cmArtifactPath)) {
        const ccArtifact = JSON.parse(fs.readFileSync(ccArtifactPath, 'utf8'));
        const cmArtifact = JSON.parse(fs.readFileSync(cmArtifactPath, 'utf8'));

        fs.writeFileSync(path.join(frontendPath, "CarbonCredit.json"), JSON.stringify({abi: ccArtifact.abi}, null, 2));
        fs.writeFileSync(path.join(frontendPath, "CarbonMarketplace.json"), JSON.stringify({abi: cmArtifact.abi}, null, 2));

        console.log("Exported ABIs successfully.");
    } else {
        console.error("Artifacts not found. Please run compile first.");
    }
} catch (e) {
    console.error("Error exporting ABIs:", e);
}
