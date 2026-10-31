import { Task } from '../types';
import { deadlineStatus, findConflicts, formatDeadline } from '../lib/deadline';

const STATUS_LABEL = {
  overdue: 'Terlambat',
  today: 'Hari ini',
  soon: '≤ 3 hari',
  ok: 'Aman',
} as const;

interface Props {
  task: Task;
  allTasks: Task[];
  userId: string;
  canManage: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export default function TaskItem({
  task,
  allTasks,
  userId,
  canManage,
  onToggle,
  onDelete,
}: Props) {
  const done = task.completedBy.includes(userId);
  const status = deadlineStatus(task.deadline);
  const conflicts = findConflicts(allTasks, task.deadline, 1, task.id);

  return (
    <li className={`task-item ${done ? 'done' : ''}`}>
      <label className="task-check">
        <input type="checkbox" checked={done} onChange={onToggle} />
        <span className="task-title">{task.title}</span>
      </label>
      {task.description && (
        <p className="muted small task-desc">{task.description}</p>
      )}
      <div className="task-meta">
        <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>
        <span className="muted small">⏰ {formatDeadline(task.deadline)}</span>
        {conflicts.length > 0 && (
          <span
            className="badge badge-warn"
            title={conflicts.map((c) => c.title).join(', ')}
          >
            Bentrok dengan {conflicts.length} tugas
          </span>
        )}
        {canManage && (
          <button className="btn btn-ghost btn-sm" onClick={onDelete}>
            Hapus
          </button>
        )}
      </div>
    </li>
  );
}
