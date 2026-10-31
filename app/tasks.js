/* app/tasks.js — CRUD tugas + ceklis */
export const loadTasks = async (classroomId = null) => {
  if (!window.supabase) return [];
  
  let query = window.supabase.from('tasks').select('*');
  
  if (classroomId) {
    query = query.eq('classroom_id', classroomId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Gagal load tugas:', error);
    return [];
  }
  
  return data || [];
};

export const createTask = async (taskData) => {
  if (!window.supabase) return null;
  
  const { data, error } = await window.supabase
    .from('tasks')
    .insert([taskData])
    .select()
    .single();
  
  if (error) {
    console.error('Gagal buat tugas:', error);
    alert(error.message);
    return null;
  }
  
  return data;
};

export const toggleTaskCompletion = async (taskId) => {
  if (!window.supabase) return null;
  
  const { data: task, error: fetchError } = await window.supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();
  
  if (fetchError) {
    console.error('Gagal ambil tugas:', fetchError);
    return null;
  }
  
  const { data, error } = await window.supabase
    .from('tasks')
    .update({ completed: !task.completed })
    .eq('id', taskId)
    .select()
    .single();
  
  if (error) {
    console.error('Gagal update tugas:', error);
    return null;
  }
  
  return data;
};

export const deleteTask = async (taskId) => {
  if (!window.supabase) return false;
  
  const { error } = await window.supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  
  if (error) {
    console.error('Gagal hapus tugas:', error);
    return false;
  }
  
  return true;
};