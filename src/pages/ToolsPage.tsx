import { useState } from 'react';
import Summarizer from '../components/tools/Summarizer';
import FileConverter from '../components/tools/FileConverter';

export default function ToolsPage() {
  const [tab, setTab] = useState<'summary' | 'converter'>('summary');

  return (
    <main className="container">
      <h2>Tools 🧰</h2>
      <p className="muted">Utilitas tambahan untuk menunjang kuliahmu.</p>
      <div className="tabs">
        <button
          className={tab === 'summary' ? 'active' : ''}
          onClick={() => setTab('summary')}
        >
          🤖 AI Summarizer
        </button>
        <button
          className={tab === 'converter' ? 'active' : ''}
          onClick={() => setTab('converter')}
        >
          📄 File Converter
        </button>
      </div>
      {tab === 'summary' ? <Summarizer /> : <FileConverter />}
    </main>
  );
}
