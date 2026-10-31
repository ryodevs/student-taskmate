import { Task } from '../types';

const DAY = 24 * 60 * 60 * 1000;

export function formatDeadline(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function msUntil(iso: string): number {
  return new Date(iso).getTime() - Date.now();
}

export type DeadlineStatus = 'overdue' | 'today' | 'soon' | 'ok';

export function deadlineStatus(iso: string): DeadlineStatus {
  const ms = msUntil(iso);

  if (ms < 0) return 'overdue';

  if (ms <= DAY) return 'today';

  if (ms <= 3 * DAY) return 'soon';

  return 'ok';
}

// Deteksi bentrokan: tugas lain yang deadline-nya berjarak
// kurang dari ±windowDays dari deadline target.
export function findConflicts(
  tasks: Task[],
  deadlineISO: string,
  windowDays = 1,
  excludeId?: string
): Task[] {
  const target = new Date(deadlineISO).getTime();
  const range = windowDays * DAY;

  return tasks.filter(
    (t) =>
      t.id !== excludeId &&
      Math.abs(new Date(t.deadline).getTime() - target) <= range
  );
}
