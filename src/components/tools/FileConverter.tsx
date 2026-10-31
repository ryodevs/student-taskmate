import { useState } from 'react';
import {
  convertImage,
  convertText,
  detectCategory,
  download,
  imageOptions,
  textOptions,
} from '../../lib/converter';
import type { Category } from '../../lib/converter';

export default function FileConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<Category>('text');
  const [target, setTarget] = useState('md');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [busy, setBusy] = useState(false);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    const cat = detectCategory(f);
    setFile(f);
    setCategory(cat);
    setTarget(cat === 'image' ? 'image/webp' : 'md');
    setError('');
    setDone('');
  };

  const baseName = () => file!.name.replace(/\.[^.]+$/, '');

  const handleConvert = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setDone('');

    try {
      if (category === 'image') {
        const blob = await convertImage(file, target);
        const ext = imageOptions().find((o) => o.mime === target)?.ext ?? 'png';
        download(blob, `${baseName()}.${ext}`);
        setDone(`Berhasil dikonversi → ${baseName()}.${ext}`);
      } else {
        const content = await file.text();
        const out = convertText(content, file.name, target);
        download(new Blob([out], { type: 'text/plain' }), `${baseName()}.${target}`);
        setDone(`Berhasil dikonversi → ${baseName()}.${target}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Konversi gagal.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card tool-card">
      <p className="muted">
        Konversi file langsung di browser — gambar (PNG / JPEG / WebP) dan
        dokumen (TXT / MD / HTML / CSV / JSON, termasuk JSON ↔ CSV).
      </p>
      <input
        type="file"
        accept="image/*,.txt,.md,.html,.csv,.json,.text"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {file && (
        <div className="convert-row">
          <span className="muted small">
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </span>
          <span>→</span>
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            {category === 'image'
              ? imageOptions().map((o) => (
                  <option key={o.mime} value={o.mime}>{o.label}</option>
                ))
              : textOptions().map((t) => (
                  <option key={t} value={t}>.{t}</option>
                ))}
          </select>
          <button className="btn" onClick={handleConvert} disabled={busy}>
            {busy ? 'Mengonversi…' : 'Konversi & Unduh'}
          </button>
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
      {done && <div className="alert alert-ok">{done}</div>}
    </div>
  );
}
