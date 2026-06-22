const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/ecochain').then(async () => {
    try {
        const hp = await bcrypt.hash('devpass', 10);
        await mongoose.connection.db.collection('users').updateMany(
            { role: 'auditor' },
            { $set: { password: hp } }
        );
        console.log('Reset all auditor passwords to devpass');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
});
