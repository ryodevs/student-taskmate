import { Link } from 'react-router-dom';
import { Classroom } from '../types';

interface Props {
  classroom: Classroom;
  userId: string;
}

export default function ClassroomCard({ classroom, userId }: Props) {
  const isOwner = classroom.ownerId === userId;
  return (
    <Link to={`/classroom/${classroom.id}`} className="card card-link">
      <div className="card-top">
        <h3>{classroom.name}</h3>
        <span className="badge">{isOwner ? 'Pemilik' : 'Anggota'}</span>
      </div>
      <p className="muted">{classroom.description || 'Tanpa deskripsi'}</p>
      <p className="muted small">
        Kode: <code>{classroom.inviteCode}</code> · {classroom.memberIds.length} anggota
      </p>
    </Link>
  );
}
