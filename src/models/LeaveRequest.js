import mongoose from 'mongoose';

const LeaveRequestSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    user_name: {
        type: String,
        default: '',
    },
    start_date: {
        type: String,
        required: true,
    },
    end_date: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
}, {
    timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' },
});

export default mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveRequestSchema);
