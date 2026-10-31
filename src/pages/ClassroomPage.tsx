import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TaskItem from '../components/TaskItem';
import { Classroom, Task } from '../types';
import { getClassroom, inviteLink } from '../lib/classes';
import { addTask, deleteTask, listByClassroom, toggleComplete } from '../lib/tasks';
import { findConflicts } from '../lib/deadline';

export default function ClassroomPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [cls, setCls] = useState<Classroom | null | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCls(getClassroom(id!) ?? null);
    setTasks(listByClassroom(id!));
  }, [id]);

  // Deteksi bentrokan: cek terhadap semua tugas yang sudah ada di kelas.
  const conflicts = useMemo(
    () =>
      deadline ? findConflicts(tasks, new Date(deadline).toISOString()) : [],
    [tasks, deadline]
  );

  if (cls === undefined) {
    return (
      <main className="container">
        <p className="muted">Memuat…</p>
      </main>
    );
  }
  if (!cls || !user || !cls.memberIds.includes(user.id)) {
    return <Navigate to="/" replace />;
  }

  const canManage = user.role === 'pengurus';
  const myDone = tasks.filter((t) => t.completedBy.includes(user.id)).length;
  const progress = tasks.length ? Math.round((myDone / tasks.length) * 100) : 0;

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!deadline) {
      setError('Deadline wajib diisi.');
      return;
    }
    addTask(cls.id, title, desc, new Date(deadline).toISOString(), user.id);
    setTasks(listByClassroom(cls.id));
    setTitle('');
    setDesc('');
    setDeadline('');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink(cls));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Salin link ini:', inviteLink(cls));
    }
  };

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h2>{cls.name}</h2>
          <p className="muted">
            {cls.description || 'Tanpa deskripsi'} · {cls.memberIds.length} anggota
          </p>
        </div>
        <div className="invite-box">
          <code>{cls.inviteCode}</code>
          <button className="btn btn-ghost btn-sm" onClick={copyLink}>
            {copied ? 'Tersalin ✓' : 'Salin link undangan'}
          </button>
        </div>
      </div>

      <div className="progress card">
        <span>
          Progres tugasku: <strong>{myDone}/{tasks.length}</strong> selesai ({progress}%)
        </span>
        <div className="progress-bar">
          <div style={{ width: `${progress}%` }} />
        </div>
      </div>

      {canManage && (
        <form className="card add-task" onSubmit={handleAdd}>
          <h3>Tambah Tugas</h3>
          <div className="form-row">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul tugas, mis. Tugas 3 Integral"
            />
            <input
              type="datetime-local"
              required
              value={deadline}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <textarea
            rows={2}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Deskripsi / catatan (opsional)"
          />
          {conflicts.length > 0 && (
            <div className="alert alert-warn">
              ⚠ Deadline ini bentrok dengan:{' '}
              <strong>{conflicts.map((t) => t.title).join(', ')}</strong>.
              Pertimbangkan mengubah tanggalnya.
            </div>
          )}
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn">+ Tambah Tugas</button>
        </form>
      )}

      <h3 className="section-title">Daftar Tugas</h3>
      {tasks.length === 0 ? (
        <div className="card empty-state">Belum ada tugas di ruang kelas ini.</div>
      ) : (
        <ul className="task-list">
          {tasks.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              allTasks={tasks}
              userId={user.id}
              canManage={canManage}
              onToggle={() => {
                toggleComplete(t.id, user.id);
                setTasks(listByClassroom(cls.id));
              }}
              onDelete={() => {
                deleteTask(t.id, user.id);
                setTasks(listByClassroom(cls.id));
              }}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
