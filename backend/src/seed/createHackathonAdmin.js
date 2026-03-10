const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function main() {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecochain';

    const email = (process.env.HACKATHON_ADMIN_EMAIL || 'admin@ecochain.dev').toLowerCase();
    const password = process.env.HACKATHON_ADMIN_PASSWORD || 'Puppalwar@123';

    await mongoose.connect(MONGO_URI);

    const hashed = await bcrypt.hash(password, 12);

    await User.updateOne(
        { email },
        {
            $set: {
                email,
                password: hashed,
                role: 'admin',
                isActive: true,
                adminProfile: { name: 'EcoChain Platform Admin', superAdmin: true },
            },
        },
        { upsert: true }
    );

    console.log(`✅ Hackathon admin ready: ${email}`);
    console.log(`🔑 Password: ${password}`);

    await mongoose.disconnect();
}

main().catch(async (err) => {
    console.error('❌ createHackathonAdmin failed:', err);
    try {
        await mongoose.disconnect();
    } catch (e) {
        // ignore
    }
    process.exit(1);
});

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function main() {
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecochain';

  const email = (process.env.HACKATHON_ADMIN_EMAIL || 'admin@ecochain.dev').toLowerCase();
  const password = process.env.HACKATHON_ADMIN_PASSWORD || 'Puppalwar@123';

  await mongoose.connect(MONGO_URI);

  const hashed = await bcrypt.hash(password, 12);

  await User.updateOne(
    { email },
    {
      $set: {
        email,
        password: hashed,
        role: 'admin',
        isActive: true,
        adminProfile: { name: 'EcoChain Platform Admin', superAdmin: true },
      },
    },
    { upsert: true }
  );

  // eslint-disable-next-line no-console
  console.log(`✅ Hackathon admin ready: ${email}`);
  // eslint-disable-next-line no-console
  console.log(`🔑 Password: ${password}`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('❌ createHackathonAdmin failed:', err);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});

