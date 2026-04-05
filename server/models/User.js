const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  avatar: { type: String, default: 'default-avatar.png' },
  preferredLanguage: { type: String, default: 'C++' },
  rank: { type: String, default: "RECRUIT" },
  
  stats: {
    crewmate: { wins: { type: Number, default: 0 } },
    imposter: { wins: { type: Number, default: 0 } }
  },
  xp: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', UserSchema);