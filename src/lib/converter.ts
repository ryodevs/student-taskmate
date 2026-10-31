// Konversi file sepenuhnya client-side.
export type Category = 'text' | 'image';

export interface ConvertOption {
  label: string;
  mime: string;
  ext: string;
}

const IMAGE_TARGETS: ConvertOption[] = [
  { label: 'PNG', mime: 'image/png', ext: 'png' },
  { label: 'JPEG', mime: 'image/jpeg', ext: 'jpg' },
  { label: 'WebP', mime: 'image/webp', ext: 'webp' },
];

const TEXT_TARGETS = ['txt', 'md', 'html', 'csv', 'json'];

export function detectCategory(file: File): Category {
  return file.type.startsWith('image/') ? 'image' : 'text';
}

export function imageOptions(): ConvertOption[] {
  return IMAGE_TARGETS;
}

export function textOptions(): string[] {
  return TEXT_TARGETS;
}

function extOf(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? 'txt';
}

export function jsonToCsv(json: string): string {
  const data = JSON.parse(json);

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('JSON harus berupa array of objects.');
  }

  const headers = Array.from(new Set(data.flatMap((row) => Object.keys(row))));

  interface CsvCellObject {
    [key: string]: CsvCell;
  }

  interface CsvCellArray extends Array<CsvCell> {}

  type CsvCell = string | number | boolean | null | CsvCellArray | CsvCellObject;

  const escape = (value: CsvCell) => {
    const isObject =
      value !== null && Object.prototype.toString.call(value) === '[object Object]';

    const s =
      Array.isArray(value) || isObject ? JSON.stringify(value) : String(value ?? '');

    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };

  const lines = [headers.join(',')];

  for (const row of data) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }

  return lines.join('\n');
}

export function csvToJson(csv: string): string {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);

  if (lines.length < 2) {
    throw new Error('CSV minimal harus punya header + 1 baris data.');
  }

  const parse = (line: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let inQ = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];

      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') {
          inQ = false;
        } else {
          cur += ch;
        }
      } else if (ch === '"') {
        inQ = true;
      } else if (ch === ',') {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }

    out.push(cur);

    return out;
  };

  const headers = parse(lines[0]);

  const rows = lines.slice(1).map((line) => {
    const cells = parse(line);

    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? '']));
  });

  return JSON.stringify(rows, null, 2);
}

function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  return doc.body.textContent ?? '';
}

export function convertText(content: string, fileName: string, target: string): string {
  const from = extOf(fileName);

  if (from === target) return content;

  if (from === 'json' && target === 'csv') return jsonToCsv(content);

  if (from === 'csv' && target === 'json') return csvToJson(content);

  if (from === 'json') return JSON.stringify(JSON.parse(content), null, 2);

  if (from === 'html' && (target === 'txt' || target === 'md')) return htmlToText(content);

  return content;
}

export async function convertImage(
  file: File,
  targetMime: string,
  quality = 0.92
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Canvas tidak didukung browser.');
  ctx.drawImage(bitmap, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Konversi gambar gagal.'))),
      targetMime,
      quality
    );
  });
}

export function download(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
