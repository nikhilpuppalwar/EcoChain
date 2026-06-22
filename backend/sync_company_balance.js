const mongoose = require('mongoose');
require('dotenv').config();

const Company = require('./src/models/Company');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Let's print all companies first
  const companies = await Company.find({});
  console.log('Found companies:', companies.map(c => ({ id: c._id, name: c.name, walletAddress: c.walletAddress, creditBalance: c.creditBalance })));

  // Update company with walletAddress matching the user's target address
  const targetWallet = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
  
  // Also, update the first company found (or all of them) just in case the wallet address isn't set yet
  if (companies.length > 0) {
    const targetComp = companies.find(c => c.walletAddress && c.walletAddress.toLowerCase() === targetWallet.toLowerCase()) || companies[0];
    
    console.log(`Updating company ${targetComp.name} (${targetComp._id}) balance...`);
    targetComp.creditBalance = 10000;
    targetComp.walletAddress = targetWallet; // ensure wallet address is set
    await targetComp.save();
    console.log(`Success! Updated balance to 10000 CCR.`);
  } else {
    console.log('No companies found in database to update.');
  }

  await mongoose.disconnect();
}

main().catch(console.error);
