const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Provider & Wallet setup
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");
const wallet = new ethers.Wallet(process.env.GOV_PRIVATE_KEY, provider);

// Load ABI
const ccPath = path.join(__dirname, '../../../web/src/contracts/CarbonCredit.json');
let ccAbi = [];
try {
    const ccJson = JSON.parse(fs.readFileSync(ccPath, 'utf8'));
    ccAbi = ccJson.abi || ccJson;
} catch (error) {
    console.error("Error loading CarbonCredit ABI in backend:", error);
}

const carbonCreditContract = new ethers.Contract(process.env.CARBON_CREDIT_ADDRESS, ccAbi, wallet);

const issueCreditsOnChain = async (companyWallet, amount, reason, metadataCID) => {
    try {
        console.log(`[BLOCKCHAIN] Issuing ${amount} credits to ${companyWallet}`);
        console.log(`[BLOCKCHAIN] Metadata CID: ${metadataCID}`);

        // Ensure amount is string or number appropriately
        const tx = await carbonCreditContract.issueCredits(companyWallet, amount);
        const receipt = await tx.wait();

        console.log(`[BLOCKCHAIN] Issue Credits Success! TX: ${receipt.hash}`);
        return receipt.hash;
    } catch (error) {
        console.error("[BLOCKCHAIN] Error issuing credits:", error);
        throw new Error("Failed to issue credits on-chain");
    }
};

const verifyEmissionOnChain = async (companyWallet, quantityTonnes, month, year, evidenceCID, entryId) => {
    console.log(`[BLOCKCHAIN] Verifying ${quantityTonnes} tonnes for ${companyWallet} (Period: ${month}/${year})`);
    console.log(`[BLOCKCHAIN] Evidence CID: ${evidenceCID}`);
    // In a full implementation, you might write this to a DataRegistry contract
    // For now, we return a mock hash since Phase 1 didn't define a verification registry contract
    return `0xverify_${Date.now()}`;
};

module.exports = { issueCreditsOnChain, verifyEmissionOnChain };
