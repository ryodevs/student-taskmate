/* app/classes.js — CRUD kelas + kode undangan */
export const createClassroom = async (name) => {
  if (!window.supabase) return null;
  
  const code = `KELAS${Math.floor(1000 + Math.random() * 8999)}`;
  
  const { data, error } = await window.supabase
    .from('classrooms')
    .insert([{ name, code, owner_id: window.authUser.id }])
    .select()
    .single();
  
  if (error) {
    console.error('Gagal buat kelas:', error);
    alert(error.message);
    return null;
  }
  
  return { data, code };
};

export const getClassrooms = async () => {
  if (!window.supabase) return [];
  
  const { data, error } = await window.supabase
    .from('classrooms')
    .select('*');
  
  if (error) {
    console.error('Gagal load kelas:', error);
    return [];
  }
  
  return data || [];
};

export const getClassroomByCode = async (code) => {
  if (!window.supabase) return null;
  
  const { data, error } = await window.supabase
    .from('classrooms')
    .select('*')
    .eq('code', code)
    .single();
  
  if (error || !data) return null;
  
  return data;
};

export const joinClassroom = async (code) => {
  if (!window.supabase) return null;
  
  const { data, error } = await window.supabase
    .from('classrooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();
  
  if (error || !data) {
    alert('Kode kelas tidak ditemukan');
    return null;
  }
  
  return data;
};