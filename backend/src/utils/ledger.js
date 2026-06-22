/**
 * logBlockchainEvent - Non-blocking event logger.
 * Saves every major workflow step to MongoDB.
 * Also tries to emit a real blockchain transaction, but NEVER crashes the workflow on failure.
 *
 * eventType: 'SUBMISSION' | 'ASSIGNED' | 'AUDIT' | 'MINT'
 */
const { ethers } = require('ethers');
const BlockchainEvent = require('../models/BlockchainEvent');

const logBlockchainEvent = async ({ eventType, submission, company, details, actor, txHash = null }) => {
    try {
        // Build a deterministic data hash (proof of data integrity)
        const dataString = JSON.stringify({
            eventType,
            submissionId: submission._id.toString(),
            companyId: (company?._id || company || submission.company).toString(),
            quantity: submission.quantityTonnes,
            period: `${submission.periodMonth}/${submission.periodYear}`,
            timestamp: Date.now()
        });
        const dataHash = ethers.id(dataString); // keccak256

        // If no real txHash, try the blockchain (non-blocking)
        let finalTxHash = txHash;
        if (!finalTxHash) {
            // Attempt to store a log on-chain. If Hardhat is down, skip gracefully.
            try {
                const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');
                // Quick connectivity check - 2 second timeout
                const networkPromise = provider.getNetwork();
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000));
                await Promise.race([networkPromise, timeoutPromise]);

                const wallet = new ethers.Wallet(process.env.GOV_PRIVATE_KEY, provider);
                // Emit a transaction with the dataHash as calldata (no contract needed — just a record)
                const tx = await wallet.sendTransaction({
                    to: wallet.address, // self-send
                    value: 0n,
                    data: ethers.hexlify(ethers.toUtf8Bytes(`EcoChain:${eventType}:${dataHash}`))
                });
                const receipt = await tx.wait();
                finalTxHash = receipt.hash;
                console.log(`[BLOCKCHAIN] ✅ ${eventType} event recorded. TX: ${finalTxHash}`);
            } catch (chainErr) {
                // Blockchain is offline — generate a deterministic pseudo-hash instead
                finalTxHash = `0x${Buffer.from(dataHash.slice(2, 66)).toString('hex')}`;
                console.warn(`[BLOCKCHAIN] ⚠️ Chain offline, using local hash for ${eventType}: ${finalTxHash}`);
            }
        }

        // Save to MongoDB — this is the source of truth for the transparency dashboard
        const companyName = company?.name || 'Unknown Company';
        const companyId = company?._id || submission.company;

        await BlockchainEvent.create({
            eventType,
            submissionId: submission._id,
            companyName,
            companyId,
            quantityTonnes: submission.quantityTonnes,
            period: `${submission.periodMonth}/${submission.periodYear}`,
            txHash: finalTxHash,
            dataHash,
            details,
            actor
        });

        console.log(`[LEDGER] ✅ BlockchainEvent saved: ${eventType} for ${companyName}`);
    } catch (err) {
        // NEVER crash the workflow — just log the error
        console.error(`[LEDGER] ❌ Failed to log ${eventType} event:`, err.message);
    }
};

module.exports = { logBlockchainEvent };
