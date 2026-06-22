const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const EcoChainAccess = await hre.ethers.getContractFactory("EcoChainAccess");
    const access = await EcoChainAccess.deploy();
    await access.waitForDeployment();
    console.log("EcoChainAccess deployed to:", access.target);

    const CarbonCredit = await hre.ethers.getContractFactory("CarbonCredit");
    const token = await CarbonCredit.deploy();
    await token.waitForDeployment();
    console.log("CarbonCredit deployed to:", token.target);

    const CarbonMarketplace = await hre.ethers.getContractFactory("CarbonMarketplace");
    const market = await CarbonMarketplace.deploy(token.target);
    await market.waitForDeployment();
    console.log("CarbonMarketplace deployed to:", market.target);

    const CreditRetirement = await hre.ethers.getContractFactory("CreditRetirement");
    const retirement = await CreditRetirement.deploy(token.target);
    await retirement.waitForDeployment();
    console.log("CreditRetirement deployed to:", retirement.target);

    const AuditRegistry = await hre.ethers.getContractFactory("AuditRegistry");
    const audit = await AuditRegistry.deploy();
    await audit.waitForDeployment();
    console.log("AuditRegistry deployed to:", audit.target);

    const deployedAddresses = {
        EcoChainAccess: access.target.toLowerCase(),
        CarbonCredit: token.target.toLowerCase(),
        AuditRegistry: audit.target.toLowerCase(),
        CarbonMarketplace: market.target.toLowerCase(),
        CreditRetirement: retirement.target.toLowerCase()
    };

    const outPath = path.join(__dirname, "..", "deployed_addresses.json");
    fs.writeFileSync(outPath, JSON.stringify(deployedAddresses, null, 2));

    const envPath = path.join(__dirname, "..", "..", "backend", ".env");
    if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent.replace(/CARBON_CREDIT_ADDRESS=.*/, `CARBON_CREDIT_ADDRESS=${deployedAddresses.CarbonCredit}`);
        envContent = envContent.replace(/MARKETPLACE_ADDRESS=.*/, `MARKETPLACE_ADDRESS=${deployedAddresses.CarbonMarketplace}`);
        envContent = envContent.replace(/RETIREMENT_ADDRESS=.*/, `RETIREMENT_ADDRESS=${deployedAddresses.CreditRetirement}`);
        envContent = envContent.replace(/AUDIT_REGISTRY_ADDRESS=.*/, `AUDIT_REGISTRY_ADDRESS=${deployedAddresses.AuditRegistry}`);
        fs.writeFileSync(envPath, envContent);
    }

    console.log("Minting 5000 CCR and Seeding Marketplace...");
    const amount = hre.ethers.parseEther("5000") / 10n ** 18n * 5000n; // just 5000 wei? No, issueCredits uses raw tokens
    
    // In CarbonCredit, issueCredits is: issueCredits(address user, uint256 amount)
    await token.issueCredits(deployer.address, 5000);
    console.log("Minted 5000 to user.");
    
    // Let's also approve and list for UI testing:
    await token.approve(market.target, 5000);
    const price = hre.ethers.parseEther("0.00001");
    await market.listCredits(5000, price);
    
    console.log("Successfully seeded marketplace!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
