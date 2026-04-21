const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profileImageUrl: {
        type: String,
        default: null
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    otp: String,
    otpExpire: Date,
    currency: { type: String, default: 'PKR' },
    language: { type: String, default: 'English (US)' },
    theme: { type: String, default: 'dark' },
    timezone: { type: String, default: 'UTC+5 (Pakistan)' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    notifications: {
        budget: { type: Boolean, default: true },
        monthly: { type: Boolean, default: false },
        security: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false }
    },
    mustChangePassword: { type: Boolean, default: false },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);