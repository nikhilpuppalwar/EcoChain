const mongoose = require('mongoose');
require('dotenv').config();
const { issueCreditsOnChain } = require('./src/utils/blockchain');
const Company = require('./src/models/Company');

async function main() {
    const targetWallet = process.argv[2];
    if (!targetWallet || !targetWallet.startsWith('0x') || targetWallet.length !== 42) {
        console.error('❌ Error: Please specify a valid Ethereum wallet address.');
        console.log('Usage: npm run mint -- <0x_wallet_address> [amount]');
        console.log('Example: npm run mint -- 0x29D98c80a30Ef993038963EE4D0a5f7578Ea40bE 5000');
        process.exit(1);
    }
    const amount = parseInt(process.argv[3], 10) || 5000;

    console.log(`Connecting to database...`);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Get all registered companies
    const companies = await Company.find({});
    if (companies.length === 0) {
        console.error('❌ Error: No companies found in MongoDB. Please register an industry account first.');
        await mongoose.disconnect();
        process.exit(1);
    }

    // Try to find the company that already has this wallet, otherwise default to the first company (e.g. UltraTech Cement)
    let targetComp = companies.find(c => c.walletAddress && c.walletAddress.toLowerCase() === targetWallet.toLowerCase()) || companies[0];

    console.log(`\nSelected Company: "${targetComp.name}"`);
    console.log(`Updating company walletAddress to: ${targetWallet}`);
    console.log(`Updating credit balance to: ${amount} CCR`);

    targetComp.walletAddress = targetWallet;
    targetComp.creditBalance = amount;
    await targetComp.save();
    console.log('✅ MongoDB mirror balance updated.');

    // Minting on blockchain
    console.log(`\n[BLOCKCHAIN] Minting ${amount} CCR to wallet address ${targetWallet} on Sepolia...`);
    try {
        const txHash = await issueCreditsOnChain(targetWallet, amount, "Hackathon Demo Minting", "QmDemoMetadataCID");
        console.log(`\n🎉 Success! Successfully minted ${amount} CCR to ${targetWallet} on Sepolia.`);
        console.log(`🔗 Transaction Hash: ${txHash}`);
    } catch (err) {
        console.error('\n❌ Blockchain Transaction Failed:', err.message);
        console.log('Please ensure your backend/.env GOV_PRIVATE_KEY has enough Sepolia ETH for gas.');
    }

    await mongoose.disconnect();
    console.log('Database connection closed.');
}

main().catch(async (err) => {
    console.error('An unexpected error occurred:', err);
    try {
        await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
});
