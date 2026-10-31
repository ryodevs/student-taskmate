import { load, save, uid } from './storage';
import { Task } from '../types';

const KEY = 'taskmate:tasks';

function getAll(): Task[] {
  return load<Task[]>(KEY, []);
}

function setAll(list: Task[]): void {
  save(KEY, list);
}

export function addTask(
  classroomId: string,
  title: string,
  description: string,
  deadline: string,
  createdBy: string
): Task {
  const list = getAll();
  const task: Task = {
    id: uid(),
    classroomId,
    title: title.trim(),
    description: description.trim(),
    deadline,
    createdBy,
    createdAt: Date.now(),
    completedBy: [],
  };
  list.push(task);
  setAll(list);
  return task;
}

export function listByClassroom(classroomId: string): Task[] {
  return getAll()
    .filter((t) => t.classroomId === classroomId)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
}

export function toggleComplete(taskId: string, userId: string): void {
  const list = getAll();
  const task = list.find((t) => t.id === taskId);
  if (!task) return;
  task.completedBy = task.completedBy.includes(userId)
    ? task.completedBy.filter((id) => id !== userId)
    : [...task.completedBy, userId];
  setAll(list);
}

export function deleteTask(taskId: string, requesterId: string): void {
  const list = getAll();
  const task = list.find((t) => t.id === taskId);
  if (!task) return;
  if (task.createdBy !== requesterId) {
    throw new Error('Hanya pembuat tugas yang bisa menghapus.');
  }
  setAll(list.filter((t) => t.id !== taskId));
}
