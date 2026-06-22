import "dotenv/config";
import hre from "hardhat";
import { writeFileSync } from "fs";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

async function main() {
  console.log("Starting deployment to Sepolia...");
  
  if (!process.env.SEPOLIA_PRIVATE_KEY || !process.env.SEPOLIA_RPC_URL) {
      throw new Error("Missing SEPOLIA_PRIVATE_KEY or SEPOLIA_RPC_URL in .env");
  }

  // Create raw viem wallet client
  let pk = process.env.SEPOLIA_PRIVATE_KEY;
  if (!pk.startsWith("0x")) pk = "0x" + pk;
  
  const account = privateKeyToAccount(pk as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL)
  }).extend(publicActions);

  async function deployRaw(contractName: string, args: any[] = []) {
    const artifact = await hre.artifacts.readArtifact(contractName);
    const hash = await client.deployContract({
      abi: artifact.abi,
      bytecode: artifact.bytecode as `0x${string}`,
      args
    });
    const receipt = await client.waitForTransactionReceipt({ hash });
    return receipt.contractAddress;
  }

  const accessAddr = await deployRaw("EcoChainAccess");
  console.log(`EcoChainAccess deployed to: ${accessAddr}`);

  const creditAddr = await deployRaw("CarbonCredit");
  console.log(`CarbonCredit deployed to: ${creditAddr}`);

  const auditAddr = await deployRaw("AuditRegistry");
  console.log(`AuditRegistry deployed to: ${auditAddr}`);

  const marketAddr = await deployRaw("CarbonMarketplace", [creditAddr]);
  console.log(`CarbonMarketplace deployed to: ${marketAddr}`);

  const retirementAddr = await deployRaw("CreditRetirement", [creditAddr]);
  console.log(`CreditRetirement deployed to: ${retirementAddr}`);

  const addresses = {
    EcoChainAccess: accessAddr,
    CarbonCredit: creditAddr,
    AuditRegistry: auditAddr,
    CarbonMarketplace: marketAddr,
    CreditRetirement: retirementAddr
  };

  writeFileSync("deployed_addresses.json", JSON.stringify(addresses, null, 2));
  console.log("✅ All contracts deployed and saved to deployed_addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
