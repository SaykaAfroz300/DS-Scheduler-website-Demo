import mongoose from 'mongoose';

const EmployeeAccessSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    email: {
        type: String,
        required: true,
    },
    full_name: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'denied', 'removed'],
        default: 'pending',
    },
    requested_at: {
        type: Date,
        default: Date.now,
    },
    approved_at: Date,
    denied_at: Date,
    removed_at: Date,
    approved_by_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    denied_by_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    removed_by_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    denial_reason: {
        type: String,
        default: '',
    },
}, {
    timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' },
});

export default mongoose.models.EmployeeAccess || mongoose.model('EmployeeAccess', EmployeeAccessSchema);
