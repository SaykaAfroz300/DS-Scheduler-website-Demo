import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    full_name: {
        type: String,
        default: '',
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    otp_code: {
        type: String,
        default: null,
    },
    otp_expires: {
        type: Date,
        default: null,
    },
}, {
    timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
