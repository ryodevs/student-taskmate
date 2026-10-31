import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ClassroomCard from '../components/ClassroomCard';
import Modal from '../components/Modal';
import { Classroom } from '../types';
import { createClassroom, joinClassroom, listForUser } from '../lib/classes';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<Classroom[]>(() =>
    listForUser(user!.id)
  );
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const isPengurus = user!.role === 'pengurus';

  const refresh = () => setClassrooms(listForUser(user!.id));

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const cls = joinClassroom(user!.id, joinCode);
      setJoinCode('');
      refresh();
      navigate(`/classroom/${cls.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal bergabung.');
    }
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isPengurus) {
      setError('Hanya akun Pengurus yang bisa membuat ruang kelas.');
      return;
    }
    const cls = createClassroom(user!.id, name, desc);
    setShowCreate(false);
    setName('');
    setDesc('');
    refresh();
    navigate(`/classroom/${cls.id}`);
  };

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h2>Halo, {user!.name} 👋</h2>
          <p className="muted">Kelola tugasmu di semua ruang kelas.</p>
        </div>
        {isPengurus && (
          <button className="btn" onClick={() => setShowCreate(true)}>
            + Buat Ruang Kelas
          </button>
        )}
      </div>

      <form className="join-bar card" onSubmit={handleJoin}>
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Masukkan kode ruang kelas, mis. KELAS1"
        />
        <button className="btn" type="submit">Gabung</button>
      </form>
      {error && <div className="alert alert-error">{error}</div>}

      <h3 className="section-title">Ruang Kelas Saya</h3>
      {classrooms.length === 0 ? (
        <div className="card empty-state">
          Belum ada ruang kelas.{' '}
          {isPengurus
            ? 'Buat ruang kelas pertamamu!'
            : 'Minta kode/link undangan ke pengurus, lalu gabung.'}
        </div>
      ) : (
        <div className="grid-cards">
          {classrooms.map((c) => (
            <ClassroomCard key={c.id} classroom={c} userId={user!.id} />
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="Buat Ruang Kelas" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Nama kelas / mata kuliah</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kalkulus I"
              />
            </div>
            <div className="form-group">
              <label>Deskripsi (opsional)</label>
              <textarea
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Singkat tentang kelas ini"
              />
            </div>
            <button className="btn btn-block">Buat &amp; dapatkan kode undangan</button>
          </form>
        </Modal>
      )}
    </main>
  );
}
