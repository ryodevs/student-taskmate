import { load, save } from './storage';
import { StoredUser, Classroom, Task } from '../types';

// Data demo yang dibuat sekali saat pertama kali aplikasi dibuka.
export function seedDemo(): void {
  const users = load<StoredUser[]>('taskmate:users', []);

  if (users.length > 0) return;

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const demoUsers: StoredUser[] = [
    {
      id: 'demo-pengurus',
      name: 'Pengurus Demo',
      email: 'pengurus@demo.id',
      role: 'pengurus',
      provider: 'email',
      createdAt: now,
      passwordHash: 'd3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791',
    },
    {
      id: 'demo-anggota',
      name: 'Anggota Demo',
      email: 'anggota@demo.id',
      role: 'anggota',
      provider: 'email',
      createdAt: now,
      passwordHash: 'd3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791',
    },
  ];

  save('taskmate:users', demoUsers);

  const cls: Classroom = {
    id: 'demo-class',
    name: 'Kalkulus I',
    description: 'Ruang kelas demo untuk mata kuliah Kalkulus.',
    ownerId: 'demo-pengurus',
    memberIds: ['demo-pengurus', 'demo-anggota'],
    inviteCode: 'KELAS1',
    createdAt: now,
  };

  save('taskmate:classrooms', [cls]);

  const tasks: Task[] = [
    {
      id: 't1',
      classroomId: 'demo-class',
      title: 'Tugas 1: Limit Fungsi',
      description: 'Kerjakan soal 1–10 di buku halaman 45.',
      deadline: new Date(now + 2 * day).toISOString(),
      createdBy: 'demo-pengurus',
      createdAt: now,
      completedBy: ['demo-anggota'],
    },
    {
      id: 't2',
      classroomId: 'demo-class',
      title: 'Kuis Online: Turunan',
      description: 'Dikerjakan mandiri, sifat open book.',
      deadline: new Date(now + day).toISOString(),
      createdBy: 'demo-pengurus',
      createdAt: now,
      completedBy: [],
    },
  ];

  save('taskmate:tasks', tasks);
}
