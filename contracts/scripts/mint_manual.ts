import hre from "hardhat";

async function main() {
  const accountAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const tokenAddress = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";

  console.log("Minting to:", accountAddress);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Using deployer address:", deployer.address);

  // Get the CarbonCredit contract factory or attach directly
  const CarbonCredit = await hre.ethers.getContractFactory("CarbonCredit");
  const contract = CarbonCredit.attach(tokenAddress);

  // Issue 5000 credits to the specified account
  const tx = await contract.issueCredits(accountAddress, 5000);
  console.log("Transaction hash:", tx.hash);

  await tx.wait();
  console.log("Credits successfully minted!");
}

main().catch(console.error);
