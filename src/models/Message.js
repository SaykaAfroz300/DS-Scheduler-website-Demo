import mongoose from 'mongoose';

// conversation_id is either:
//   'team'          -> the shared team group chat (all employees + admin)
//   'dm:<userId>'   -> private chat between that employee and the admin(s)
const MessageSchema = new mongoose.Schema({
    conversation_id: {
        type: String,
        required: true,
        index: true,
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sender_name: {
        type: String,
        default: '',
    },
    sender_role: {
        type: String,
        default: 'user',
    },
    text: {
        type: String,
        required: true,
        maxlength: 4000,
    },
    read_by: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' },
});

MessageSchema.index({ conversation_id: 1, created_date: -1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
