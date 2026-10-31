export type Role = 'pengurus' | 'anggota';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  provider: 'email' | 'google';
  createdAt: number;
}

export interface StoredUser extends User {
  passwordHash?: string;
}

export interface Classroom {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  inviteCode: string;
  createdAt: number;
}

export interface Task {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  deadline: string; // ISO string
  createdBy: string;
  createdAt: number;
  completedBy: string[]; // userId yang sudah menceklis
}
