// Ringkasan ekstraktif berbasis frekuensi kata (algoritma Luhn-ish).
// Berjalan 100% di browser — tanpa API key / backend.

const STOPWORDS = new Set(
  (
    'yang dan di ke dari untuk dengan pada dalam ini itu atau juga akan telah tidak ' +
    'ada sebagai ialah lebih serta antara hingga melalui dapat bagi agar supaya karena ' +
    'the a an and or of to in for on with is are was were be been it this that as at by from'
  ).split(' ')
);

function tokenize(s: string): string[] {
  return s.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

export function summarize(text: string, ratio = 0.3): string {
  const clean = text.trim();
  if (!clean) return '';
  const sentences =
    clean.match(/[^.!?\n]+[.!?]?/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
  if (sentences.length <= 3) return clean;

  const freq = new Map<string, number>();
  for (const s of sentences) {
    for (const w of tokenize(s)) {
      if (!STOPWORDS.has(w) && w.length > 2) {
        freq.set(w, (freq.get(w) ?? 0) + 1);
      }
    }
  }

  const scored = sentences.map((s, i) => {
    const words = tokenize(s).filter((w) => !STOPWORDS.has(w));
    const score =
      words.reduce((sum, w) => sum + (freq.get(w) ?? 0), 0) /
      Math.sqrt(words.length || 1);
    return { i, score };
  });

  const count = Math.max(1, Math.ceil(sentences.length * ratio));
  const top = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.i)
    .sort((a, b) => a - b);

  return top.map((i) => sentences[i]).join(' ');
}
