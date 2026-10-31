import { load, save, uid } from './storage';
import { Classroom } from '../types';

const KEY = 'taskmate:classrooms';

function getAll(): Classroom[] {
  return load<Classroom[]>(KEY, []);
}

function setAll(list: Classroom[]): void {
  save(KEY, list);
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createClassroom(
  ownerId: string,
  name: string,
  description: string
): Classroom {
  const list = getAll();
  let code = generateCode();
  while (list.some((c) => c.inviteCode === code)) {
    code = generateCode();
  }
  const cls: Classroom = {
    id: uid(),
    name: name.trim(),
    description: description.trim(),
    ownerId,
    memberIds: [ownerId],
    inviteCode: code,
    createdAt: Date.now(),
  };
  list.push(cls);
  setAll(list);
  return cls;
}

export function getClassroom(id: string): Classroom | undefined {
  return getAll().find((c) => c.id === id);
}

export function joinClassroom(userId: string, code: string): Classroom {
  const list = getAll();
  const normalized = code.trim().toUpperCase();
  const cls = list.find((c) => c.inviteCode === normalized);
  if (!cls) {
    throw new Error('Kode ruang kelas tidak ditemukan.');
  }
  if (cls.memberIds.includes(userId)) {
    throw new Error('Kamu sudah tergabung di ruang kelas ini.');
  }
  cls.memberIds.push(userId);
  setAll(list);
  return cls;
}

export function listForUser(userId: string): Classroom[] {
  return getAll().filter((c) => c.memberIds.includes(userId));
}

export function inviteLink(cls: Classroom): string {
  return `${window.location.origin}/join/${cls.inviteCode}`;
}
