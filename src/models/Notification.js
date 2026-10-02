import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['task_completed', 'task_assigned', 'deadline_approaching', 'leave_requested', 'leave_status_update'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    related_task_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    },
    read: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' },
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
