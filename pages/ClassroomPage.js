/* pages/ClassroomPage.js — halaman ruang kelas */
export default function ClassroomPage() {
  const main = document.createElement('main');

  // Tombol buat kelas
  const createBtn = document.createElement('button');
  createBtn.className = 'btn';
  createBtn.textContent = 'Buat Kelas Baru';
  createBtn.onclick = async () => {
    const name = prompt('Nama kelas:');
    if (!name) return;
    
    const code = `KELAS${Math.floor(1000 + Math.random() * 8999)}`;
    
    try {
      const { error } = await window.supabase
        .from('classrooms')
        .insert({ name, code, owner_id: window.authUser.id });
      if (error) throw error;
      alert(`Kelas dibuat! Kode undangan: ${code}`);
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Gagal buat kelas');
    }
  };

  // Form gabung kelas
  const joinForm = document.createElement('form');
  joinForm.className = 'card';
  joinForm.innerHTML = `
    <h3>Gabung Kelas</h3>
    <input type="text" id="join-code" placeholder "Masukkan kode undangan" required />
    <button type="submit" class="btn">Gabung</button>
  `;

  joinForm.onsubmit = async (e) => {
    e.preventDefault();
    const code = e.target.querySelector('#join-code').value.toUpperCase();
    
    try {
      const { data, error } = await window.supabase
        .from('classrooms')
        .select('*')
        .eq('code', code)
        .single();
      
      if (error || !data) throw new Error('Kode tidak ditemukan');
      alert(`Berhasil gabung kelas: ${data.name}`);
      window.location.href = `/classroom/${data.id}`;
    } catch (err) {
      alert(err.message || 'Kode salah');
    }
  };

  // Header actions
  const header = document.createElement('header');
  header.innerHTML = `
    <h1>Ruang Kelas</h1>
    ${window.userRole === 'admin' ? `<button onclick="createClassroom()">` : ''}
    ${window.userRole === 'admin' ? 'Buat Kelas' : ''}
  `;

  main.appendChild(header);
  main.appendChild(createBtn);
  main.appendChild(joinForm);

  return main;
}