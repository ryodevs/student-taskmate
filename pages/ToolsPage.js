/* pages/ToolsPage.js — halaman tools: summarizer + file converter */
export default function ToolsPage() {
  const main = document.createElement('main');

  // --- AI Summarizer ---
  const summarizerSection = document.createElement('section');
  summarizerSection.className = 'section';
  summarizerSection.innerHTML = `
    <h2>AI Summarizer</h2>
    <div class="card">
      <textarea id="summarizer-input" rows="8" placeholder="Masukkan teks yang akan diringkas..."></textarea>
      <div style="margin-top: 12px;">
        <button id="summarize-btn" class="btn">Ringkas</button>
        <span id="summarize-loading" style="display: none; margin-left: 8px;">...</span>
      </div>
    </div>
    <div id="summarizer-result" style="margin-top: 20px; display: none;"></div>
  `;

  // Logika summarizer: frekuensi kata sederhana
  const summarizeText = () => {
    const input = document.getElementById('summarizer-input').value;
    const resultDiv = document.getElementById('summarizer-result');
    const loading = document.getElementById('summarize-loading');
    
    if (!input.trim()) {
      alert('Masukkan teks terlebih dahulu');
      return;
    }

    loading.style.display = 'inline';
    summarizeBtn.disabled = true;

    // Algoritma frekuensi kata (100% offline)
    const stopWords = ['yang', 'dan', 'untuk', 'dengan', 'pada', 'ini', 'itu', 'untuk', 'dari', 'ke'];
    const words = input.toLowerCase().match(/[a-zA-Z]+/g) || [];
    const freq = {};

    words.forEach(word => {
      if (!stopWords.includes(word)) {
        freq[word] = (freq[word] || 0) + 1;
      }
    });

    // Urutkan berdasarkan frekuensi
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const topWords = sorted.map(([word]) => word);

    loading.style.display = 'none';
    summarizeBtn.disabled = false;

    resultDiv.innerHTML = `
      <h3>Hasil Ringkasan</h3>
      <p>Kata kunci utama: <strong>${topWords.join(', ')}</strong></p>
      <p>Teks ini di-ringkas berdasarkan frekuensi kata yang paling sering muncul. Semua proses terjadi 100% di browser tanpa server.</p>
    `;
    resultDiv.style.display = 'block';
  };

  const summarizeBtn = summarizerSection.querySelector('#summarize-btn');

  summarizeBtn.onclick = summarizeText;

  // --- File Converter ---
  const converterSection = document.createElement('section');
  converterSection.className = 'section';
  converterSection.innerHTML = `
    <h2>File Converter</h2>
    <div class="card">
      <p>Gambar (PNG/JPEG/WebP via Canvas)</p>
      <input type="file" id="image-input" accept="image/*" style="display: none;" />
      <button id="convert-image-btn" class="btn" style="margin-bottom: 8px;">Unggah Gambar</button>
      <div id="image-result" style="margin-top: 12px; min-height: 80px;"></div>

      <p style="margin-top: 24px; font-size: 13px;">&nbsp;</p>
      <p>Dokumen (TXT/MD/HTML/CSV/JSON)</p>
      <input type="file" id="doc-input" accept=".txt,.md,.html,.csv,.json" style="display: none;" />
      <button id="convert-doc-btn" class="btn" style="margin-bottom: 8px;">Unggah Dokumen</button>
      <div id="doc-result" style="margin-top: 12px;"></div>
    </div>
  `;

  // Image conversion via canvas
  const imageInput = converterSection.querySelector('#image-input');
  const convertImageBtn = converterSection.querySelector('#convert-image-btn');
  const imageResult = converterSection.querySelector('#image-result');

  convertImageBtn.onclick = () => imageInput.click();

  imageInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Resize sederhana menyesuaikan lebar maks 800px
      const maxWidth = 800;
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to WebP quality 80
      const dataURL = canvas.toDataURL('image/webp', 0.8);
      
      imageResult.innerHTML = `
        <p>Original: ${file.name} (${(file.size / 1024).toFixed(1)} KB)</p>
        <p>Converted to WebP: ${(dataURL.split(',')[0].split(':')[1].split(';')[0]).replace('image/', '')} KB (estimasi)</p>
        <a href="${dataURL}" download="converted-webp" class="btn">Download WebP</a>
      `;
    };
    
    img.src = URL.createObjectURL(file);
  };

  // Document conversion
  const docInput = converterSection.querySelector('#doc-input');
  const convertDocBtn = converterSection.querySelector('#convert-doc-btn');
  const docResult = converterSection.querySelector('#doc-result');

  convertDocBtn.onclick = () => docInput.click();

  docInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target.result;
      const type = file.name.split('.').pop().toLowerCase();

      let output = '';
      let format = '';

      switch (type) {
        case 'txt':
          output = content.toString();
          format = 'TXT';
          break;
        case 'md':
          output = content.toString();
          format = 'MD';
          break;
        case 'html':
          output = content.toString();
          format = 'HTML';
          break;
        case 'csv':
          // Parse CSV sederhana
          const rows = content.toString().split('\n').map(row => row.split(','));
          output = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
          format = 'CSV';
          break;
        case 'json':
          try {
            const parsed = JSON.parse(content.toString());
            output = JSON.stringify(parsed, null, 2);
            format = 'JSON';
          } catch (e) {
            alert('File JSON tidak valid');
            return;
          }
          break;
        default:
          alert('Format dokument tidak didukung');
          return;
      }

      docResult.innerHTML = `
        <h3>Konversi ${format}</h3>
        <textarea rows="8" style="width: 100%; padding: 8px; font-family: inherit;">${output}</textarea>
        <button class="btn" style="margin-top: 8px;">Salin ke Clipboard</button>
      `;
    };

    reader.readAsText(file);
  };

  main.appendChild(summarizerSection);
  main.appendChild(converterSection);

  return main;
}