// createUser.js
// Run using: node createUser.js

const mongoose = require('mongoose');
const User = require('./models/User'); // adjust path if needed

const MONGO_URI="mongodb+srv://jashthakkar140_db_user:MY_PASSWORD@cluster0.l055d3r.mongodb.net/mediguard?retryWrites=true&w=majority&appName=Cluster0";

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const sampleUser = new User({
      username: 'demoUser02',
      password: 'Password@123',
      role: 'patient',
      profile: {
        fullName: 'Demo Person',
        email: 'demo@example.com',
        phone: '9876543210',
        dateOfBirth: new Date('2000-01-01'),
        gender: 'male'
      }
    });

    const saved = await sampleUser.save();
    console.log('User inserted successfully:\n', saved);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
