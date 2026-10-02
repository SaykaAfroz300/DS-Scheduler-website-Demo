import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    platform: {
        type: String,
        enum: ['youtube', 'spotify', 'instagram', 'snapchat', 'facebook'],
        required: true,
    },
    content_type: {
        type: String,
        enum: ['video', 'static'],
        default: 'video',
    },
    deadline: {
        type: Date,
        required: true,
    },
    assigned_to_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assigned_to_name: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending',
    },
    google_drive_link: {
        type: String,
        default: '',
    },
    notes: {
        type: String,
        default: '',
    },
    created_by_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' },
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
