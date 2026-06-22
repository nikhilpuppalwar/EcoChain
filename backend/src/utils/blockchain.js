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

// Load AuditRegistry ABI (We need to export it from contracts first, or just dynamically define it since it's simple)
const auditRegistryAbi = [
    "function storeReport(uint256 industryId, bytes32 reportHash, bytes auditorSig, string verificationStatus) external"
];
const auditRegistryContract = new ethers.Contract(process.env.AUDIT_REGISTRY_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", auditRegistryAbi, wallet);

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

const storeAuditReport = async (submission, auditReport) => {
    try {
        console.log(`[BLOCKCHAIN] Storing Audit Report for Submission: ${submission._id}`);
        // For hackathon, convert ID strings to uint256 mock/hash 
        const mockIndustryId = parseInt(submission.company.toString().substring(0,8), 16) || 1234;
        
        // Ensure valid 32 byte hash for the report
        const reportHash = ethers.id(`report_${submission._id}_${Date.now()}`);
        
        // Use empty bytes for mock signature if not valid format
        const auditorSig = auditReport.auditors[0]?.digitalSignature || "0x00"; 
        
        const tx = await auditRegistryContract.storeReport(
            mockIndustryId,
            reportHash,
            ethers.getBytes(ethers.hexlify(ethers.toUtf8Bytes("mockSignatureForHackathon"))),
            auditReport.finalDecision
        );
        const receipt = await tx.wait();
        
        console.log(`[BLOCKCHAIN] Audit Report stored on-chain! TX: ${receipt.hash}`);
        return receipt.hash;
    } catch (error) {
        console.error("[BLOCKCHAIN] Error storing audit report:", error);
        throw new Error("Failed to store audit report on-chain");
    }
};

module.exports = { issueCreditsOnChain, verifyEmissionOnChain, storeAuditReport };
