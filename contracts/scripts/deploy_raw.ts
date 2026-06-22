import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    const [deployer] = await hre.viem.getWalletClients();
    console.log("Deploying contracts with account:", deployer.account.address);

    const publicClient = await hre.viem.getPublicClient();

    // Deploy Access
    const access = await hre.viem.deployContract("EcoChainAccess");
    console.log("EcoChainAccess deployed to:", access.address);

    // Deploy Token
    const token = await hre.viem.deployContract("CarbonCredit");
    console.log("CarbonCredit deployed to:", token.address);

    // Deploy Marketplace
    const market = await hre.viem.deployContract("CarbonMarketplace", [token.address]);
    console.log("CarbonMarketplace deployed to:", market.address);

    // Deploy Retirement
    const retirement = await hre.viem.deployContract("CreditRetirement", [token.address]);
    console.log("CreditRetirement deployed to:", retirement.address);

    // Deploy AuditRegistry
    const audit = await hre.viem.deployContract("AuditRegistry");
    console.log("AuditRegistry deployed to:", audit.address);

    // Write to deployed_addresses.json
    const deployedAddresses = {
        EcoChainAccess: access.address,
        CarbonCredit: token.address,
        AuditRegistry: audit.address,
        CarbonMarketplace: market.address,
        CreditRetirement: retirement.address
    };

    const outPath = path.join(__dirname, "..", "deployed_addresses.json");
    fs.writeFileSync(outPath, JSON.stringify(deployedAddresses, null, 2));
    console.log("Saved deployed addresses to:", outPath);

    // Update backend .env
    const envPath = path.join(__dirname, "..", "..", "backend", ".env");
    if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent.replace(/CARBON_CREDIT_ADDRESS=.*/, `CARBON_CREDIT_ADDRESS=${token.address}`);
        envContent = envContent.replace(/MARKETPLACE_ADDRESS=.*/, `MARKETPLACE_ADDRESS=${market.address}`);
        envContent = envContent.replace(/RETIREMENT_ADDRESS=.*/, `RETIREMENT_ADDRESS=${retirement.address}`);
        envContent = envContent.replace(/AUDIT_REGISTRY_=.*|AUDIT_REGISTRY_ADDRESS=.*/, `AUDIT_REGISTRY_ADDRESS=${audit.address}`);
        fs.writeFileSync(envPath, envContent);
        console.log("Updated backend .env");
    }

    // Now, let's MINT the 5000 CCR!
    const userAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    console.log(`Minting 5000 CCR to ${userAddress}...`);
    
    await token.write.issueCredits([userAddress, 5000n]);
    console.log("Minting complete! You now have 5000 CCR.");

    // Run export ABIs just in case
    // This requires node scripts/export_abis.js but we will just let it be, they are already exported.
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
