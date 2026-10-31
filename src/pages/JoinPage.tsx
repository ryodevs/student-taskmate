import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { joinClassroom } from '../lib/classes';

export default function JoinPage() {
  const { code } = useParams();
  const { user } = useAuth();
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [classId, setClassId] = useState('');

  useEffect(() => {
    try {
      const cls = joinClassroom(user!.id, code!);
      setClassId(cls.id);
      setState('ok');
    } catch {
      setState('error');
    }
  }, [code, user]);

  return (
    <main className="container page-center">
      {state === 'loading' && <p className="muted">Bergabung ke ruang kelas…</p>}
      {state === 'ok' && (
        <div className="card" style={{ textAlign: 'center', maxWidth: 420 }}>
          <h2>Berhasil bergabung</h2>
          <p className="muted">Kamu sekarang adalah anggota ruang kelas ini.</p>
          <Link className="btn" to={`/classroom/${classId}`}>
            Buka Ruang Kelas
          </Link>
        </div>
      )}
      {state === 'error' && (
        <div className="card" style={{ textAlign: 'center', maxWidth: 420 }}>
          <h2>Gagal bergabung</h2>
          <p className="muted">Kode tidak valid atau kamu sudah menjadi anggota.</p>
          <Link className="btn" to="/">Kembali ke Dashboard</Link>
        </div>
      )}
    </main>
  );
}
