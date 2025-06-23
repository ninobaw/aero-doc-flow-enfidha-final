const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['SUPER_ADMIN', 'ADMINISTRATOR', 'APPROVER', 'USER', 'VISITOR', 'AGENT_BUREAU_ORDRE'], // Added AGENT_BUREAU_ORDRE
    default: 'USER' 
  },
  profilePhoto: { type: String },
  airport: { 
    type: String, 
    enum: ['ENFIDHA', 'MONASTIR', 'GENERALE'], 
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  phone: { type: String },
  department: { type: String },
  position: { type: String },
  lastLogin: { type: Date },
  resetPasswordToken: { type: String }, // Nouveau champ pour le jeton de réinitialisation
  resetPasswordExpires: { type: Date }, // Nouveau champ pour la date d'expiration du jeton
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

const User = model('User', UserSchema);
module.exports = { User };