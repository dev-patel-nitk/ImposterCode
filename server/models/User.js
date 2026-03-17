const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

  username: { type: String, required: true, unique: true },
 avatar: { type: String, default: 'default-avatar.png' }, 
    winsCrewmate: { type: Number, default: 0 },
  winsImposter: { type: Number, default: 0 },
  preferredLanguage: { type: String, default: 'C++' },
  rankingPoints: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', UserSchema);