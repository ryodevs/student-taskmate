/* pages/JoinPage.js — halaman gabung kelas lewat kode */
export default function JoinPage() {
  const main = document.createElement('main');

  const joinForm = document.createElement('form');
  joinForm.className = 'card';
  joinForm.innerHTML = `
    <h2>Gabung Kelas</h2>
    <p>Masukkan kode undangan yang diberikan pengurus</p>
    <input type="text" id="class-code" placeholder="KELAS1" required />
    <button type="submit" class="btn">Gabung Kelas</button>
    <p style="margin-top: 16px; font-size: 13px; color: var(--muted);">
      Atau <a href="/dashboard">masuk ke dashboard</a>
    </p>
  `;

  joinForm.onsubmit = async (e) => {
    e.preventDefault();
    const code = e.target.querySelector('#class-code').value.toUpperCase().trim();

    if (!code) {
      alert('Masukkan kode undangan');
      return;
    }

    try {
      const { data, error } = await window.supabase
        .from('classrooms')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !data) {
        alert('Kode kelas tidak ditemukan. Cek kembali kode yang diberikan pengurus.');
        return;
      }

      alert(`Berhasil gabung kelas: ${data.name}`);
      window.location.href = `/classroom/${data.id}`;
    } catch (err) {
      alert(err.message || 'Terjadi kesalahan');
    }
  };

  main.appendChild(joinForm);
  return main;
}