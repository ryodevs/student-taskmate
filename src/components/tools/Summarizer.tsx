import { useState } from 'react';
import { summarize } from '../../lib/summarizer';

export default function Summarizer() {
  const [text, setText] = useState('');
  const [ratio, setRatio] = useState(0.3);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reduction =
    text.length > 0 && result.length > 0
      ? Math.round((1 - result.length / text.length) * 100)
      : 0;

  return (
    <div className="card tool-card">
      <p className="muted">
        Ringkas materi bacaan panjang jadi kalimat-kalimat penting.
        Algoritma ekstraktif — berjalan 100% di browser, tanpa API key.
      </p>
      <textarea
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tempel teks di sini…"
      />
      <div className="form-row">
        <label className="muted small" style={{ flex: 2, minWidth: 200 }}>
          Panjang ringkasan: {Math.round(ratio * 100)}%
        </label>
        <input
          type="range"
          min={10}
          max={60}
          value={ratio * 100}
          onChange={(e) => setRatio(Number(e.target.value) / 100)}
        />
        <button
          className="btn"
          onClick={() => setResult(summarize(text, ratio))}
          disabled={!text.trim()}
        >
          Ringkas ✨
        </button>
      </div>
      {result && (
        <div className="result-box">
          <div className="result-head">
            <strong>Hasil ringkasan</strong>
            <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
              {copied ? 'Tersalin ✓' : 'Salin'}
            </button>
          </div>
          <p>{result}</p>
          <p className="muted small">
            {text.length} → {result.length} karakter (−{reduction}%)
          </p>
        </div>
      )}
    </div>
  );
}
