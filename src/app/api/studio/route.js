import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { getAuthUser } from '@/lib/auth';
import Task from '@/models/Task';
import Notification from '@/models/Notification';
import LeaveRequest from '@/models/LeaveRequest';
import EmployeeAccess from '@/models/EmployeeAccess';

// Helper to check admin
function requireAdmin(user) {
    if (user.role !== 'admin') {
        throw { status: 403, message: 'Admin only' };
    }
}

// Helper to check approved
async function requireApproved(user) {
    if (user.role === 'admin') return;
    const access = await EmployeeAccess.findOne({ user_id: user.id, status: 'approved' });
    if (!access) {
        throw { status: 403, message: 'Your access is not approved' };
    }
}

function toPlain(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    obj.id = (obj._id || obj.id).toString();
    if (obj.user_id) obj.user_id = obj.user_id.toString();
    if (obj.assigned_to_id) obj.assigned_to_id = obj.assigned_to_id.toString();
    if (obj.created_by_id) obj.created_by_id = obj.created_by_id.toString();
    if (obj.approved_by_id) obj.approved_by_id = obj.approved_by_id.toString();
    if (obj.denied_by_id) obj.denied_by_id = obj.denied_by_id.toString();
    if (obj.removed_by_id) obj.removed_by_id = obj.removed_by_id.toString();
    if (obj.related_task_id) obj.related_task_id = obj.related_task_id.toString();
    delete obj._id;
    delete obj.__v;
    return obj;
}

export async function POST(request) {
    try {
        await dbConnect();
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { op } = body;
        const isAdmin = user.role === 'admin';

        switch (op) {
            case 'load': {
                await requireApproved(user);

                // Load tasks
                let tasks;
                if (isAdmin) {
                    tasks = await Task.find({}).sort({ deadline: -1 }).limit(200).lean();
                } else {
                    tasks = await Task.find({ assigned_to_id: user.id }).sort({ deadline: -1 }).limit(200).lean();
                }

                // Load notifications for this user
                const notifications = await Notification.find({ user_id: user.id })
                    .sort({ created_date: -1 })
                    .limit(100)
                    .lean();

                // Load leave requests
                let leaveRequests;
                if (isAdmin) {
                    leaveRequests = await LeaveRequest.find({}).sort({ created_date: -1 }).limit(100).lean();
                } else {
                    leaveRequests = await LeaveRequest.find({ user_id: user.id }).sort({ created_date: -1 }).limit(100).lean();
                }

                // Load users (approved employees) for admin dropdown
                let users = [];
                if (isAdmin) {
                    const accessRecords = await EmployeeAccess.find({ status: 'approved' }).limit(500).lean();
                    users = accessRecords.map(a => ({
                        id: a.user_id.toString(),
                        email: a.email || '',
                        full_name: a.full_name || '',
                        role: 'user',
                    }));
                } else {
                    users = [{ id: user.id, email: user.email, full_name: user.full_name, role: user.role }];
                }

                return NextResponse.json({
                    tasks: tasks.map(t => {
                        t.id = t._id.toString();
                        if (t.assigned_to_id) t.assigned_to_id = t.assigned_to_id.toString();
                        if (t.created_by_id) t.created_by_id = t.created_by_id.toString();
                        delete t._id; delete t.__v;
                        return t;
                    }),
                    notifications: notifications.map(n => {
                        n.id = n._id.toString();
                        if (n.user_id) n.user_id = n.user_id.toString();
                        if (n.related_task_id) n.related_task_id = n.related_task_id.toString();
                        delete n._id; delete n.__v;
                        return n;
                    }),
                    leaveRequests: leaveRequests.map(l => {
                        l.id = l._id.toString();
                        if (l.user_id) l.user_id = l.user_id.toString();
                        delete l._id; delete l.__v;
                        return l;
                    }),
                    users,
                });
            }

            case 'createTask': {
                requireAdmin(user);
                const d = body.task || {};

                let assigneeName = '';
                if (d.assigned_to_id) {
                    const access = await EmployeeAccess.findOne({ user_id: d.assigned_to_id, status: 'approved' });
                    if (access) {
                        assigneeName = access.full_name || access.email || '';
                    }
                }

                const task = await Task.create({
                    title: d.title,
                    platform: d.platform,
                    content_type: d.content_type,
                    deadline: d.deadline,
                    assigned_to_id: d.assigned_to_id,
                    assigned_to_name: assigneeName,
                    status: 'pending',
                    google_drive_link: d.google_drive_link || '',
                    notes: d.notes || '',
                    created_by_id: user.id,
                });

                // Notify the assignee
                if (d.assigned_to_id) {
                    await Notification.create({
                        user_id: d.assigned_to_id,
                        type: 'task_assigned',
                        message: `New task assigned: "${d.title}"`,
                        related_task_id: task._id,
                        read: false,
                    });
                }

                return NextResponse.json({ task: toPlain(task) });
            }

            case 'completeTask': {
                await requireApproved(user);
                const task = body.task || {};
                await Task.findByIdAndUpdate(task.id, { status: 'completed' });

                // Notify admin
                if (task.created_by_id) {
                    await Notification.create({
                        user_id: task.created_by_id,
                        type: 'task_completed',
                        message: `${task.assigned_to_name || 'Employee'} completed "${task.title}"`,
                        related_task_id: task.id,
                        read: false,
                    });
                }

                return NextResponse.json({ ok: true });
            }

            case 'deleteTask': {
                requireAdmin(user);
                await Task.findByIdAndDelete(body.taskId);
                return NextResponse.json({ ok: true });
            }

            case 'updateTaskNotes': {
                requireAdmin(user);
                const { taskId, notes } = body;
                await Task.findByIdAndUpdate(taskId, { notes: notes || '' });
                return NextResponse.json({ ok: true });
            }

            case 'submitLeave': {
                await requireApproved(user);
                const d = body.leave || {};
                await LeaveRequest.create({
                    start_date: d.start_date,
                    end_date: d.end_date,
                    reason: d.reason,
                    user_id: user.id,
                    user_name: user.full_name || user.email || '',
                    status: 'pending',
                });
                return NextResponse.json({ ok: true });
            }

            case 'respondLeave': {
                requireAdmin(user);
                const r = body.request || {};
                await LeaveRequest.findByIdAndUpdate(r.id, { status: body.status });
                await Notification.create({
                    user_id: r.user_id,
                    type: 'leave_status_update',
                    message: `Your leave request (${r.start_date} to ${r.end_date}) was ${body.status}`,
                    read: false,
                });
                return NextResponse.json({ ok: true });
            }

            case 'markNotificationsRead': {
                await requireApproved(user);
                const ids = body.ids || [];
                if (ids.length) {
                    await Notification.updateMany(
                        { _id: { $in: ids }, user_id: user.id },
                        { $set: { read: true } }
                    );
                }
                return NextResponse.json({ ok: true });
            }

            case 'removeEmployee': {
                requireAdmin(user);
                await EmployeeAccess.updateMany(
                    { user_id: body.userId },
                    { $set: { status: 'removed', removed_at: new Date(), removed_by_id: user.id } }
                );
                return NextResponse.json({ ok: true });
            }

            case 'loadAccess': {
                requireAdmin(user);
                const records = await EmployeeAccess.find({}).limit(500).lean();
                const tasks = await Task.find({}).limit(1000).lean();

                const stats = {};
                for (const t of tasks) {
                    if (!t.assigned_to_id) continue;
                    const key = t.assigned_to_id.toString();
                    stats[key] = stats[key] || { pending: 0, completed: 0 };
                    if (t.status === 'completed') stats[key].completed++;
                    else stats[key].pending++;
                }

                const rows = records.map(a => ({
                    id: a._id.toString(),
                    user_id: a.user_id.toString(),
                    email: a.email || '',
                    full_name: a.full_name || '',
                    status: a.status,
                    requested_at: a.requested_at,
                    approved_at: a.approved_at,
                    denied_at: a.denied_at,
                    removed_at: a.removed_at,
                    denial_reason: a.denial_reason || '',
                    tasks: stats[a.user_id.toString()] || { pending: 0, completed: 0 },
                }));

                return NextResponse.json({ rows });
            }

            case 'approve': {
                requireAdmin(user);
                await EmployeeAccess.updateMany(
                    { user_id: body.userId },
                    { $set: { status: 'approved', approved_at: new Date(), approved_by_id: user.id } }
                );
                return NextResponse.json({ ok: true });
            }

            case 'deny': {
                requireAdmin(user);
                await EmployeeAccess.updateMany(
                    { user_id: body.userId },
                    { $set: { status: 'denied', denied_at: new Date(), denied_by_id: user.id, denial_reason: body.reason || '' } }
                );
                return NextResponse.json({ ok: true });
            }

            default:
                return NextResponse.json({ error: 'Unknown op' }, { status: 400 });
        }
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || 'Internal server error';
        return NextResponse.json({ error: message }, { status });
    }
}
