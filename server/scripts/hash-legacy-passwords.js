/*
  Script to hash legacy plain-text passwords in the users collection.
  Usage (PowerShell):
    node server/scripts/hash-legacy-passwords.js
  It requires the same environment/config as the main app (mongodb config path).
*/

const mongoose = require('mongoose');
const argon2 = require('argon2');
const dbConfig = require('../config/mongodb.config');

async function main() {
  try {
    await mongoose.connect(dbConfig.url, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = require('../src/models');
    const User = db.user;

    const users = await User.find({ password: { $not: /^\$/ } });
    console.log(`Found ${users.length} users with non-hashed passwords`);

    let updated = 0;
    for (const u of users) {
      if (!u.password) continue;
      if (u.password.startsWith('$')) continue;
      const hashed = await argon2.hash(u.password);
      await User.findByIdAndUpdate(u._id, { password: hashed });
      updated++;
    }

    console.log(`Updated ${updated} users.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
