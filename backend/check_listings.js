const mongoose = require('mongoose');
require('dotenv').config();

const MarketplaceListing = require('./src/models/MarketplaceListing');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const listings = await MarketplaceListing.find({});
  console.log('Listings in database:', JSON.stringify(listings, null, 2));

  await mongoose.disconnect();
}

main().catch(console.error);
