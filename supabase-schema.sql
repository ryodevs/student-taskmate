-- ===========================================
-- TaskMate — Supabase Schema
-- Jalankan di SQL Editor Supabase Dashboard
-- ===========================================

-- 1. Tabel kelas (dibuat oleh pengurus)
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null default substr(replace(gen_random_uuid()::text, '-', ''), 1, 6),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 2. Tabel anggota kelas
create table if not exists class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (class_id, user_id)
);

-- 3. Tabel tugas (dibuat oleh pengurus di dalam kelas)
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  title text not null,
  description text default '',
  deadline timestamptz,
  priority text not null default 'sedang' check (priority in ('tinggi', 'sedang', 'rendah')),
  created_at timestamptz not null default now()
);

-- Migrasi: jalankan ini kalau tabel tasks sudah ada
-- alter table tasks add column if not exists priority text not null default 'sedang'
--   check (priority in ('tinggi', 'sedang', 'rendah'));

-- 4. Tabel checklist tugas (per anggota)
create table if not exists task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (task_id, user_id)
);

-- ===========================================
-- Row Level Security
-- ===========================================

alter table classes enable row level security;
alter table class_members enable row level security;
alter table tasks enable row level security;
alter table task_completions enable row level security;

-- CLASSES: pengurus bisa buat & lihat kelasnya sendiri
create policy "Pengurus bisa buat kelas"
  on classes for insert
  with check (auth.uid() = created_by);

create policy "Pengurus bisa lihat kelasnya"
  on classes for select
  using (auth.uid() = created_by);

-- CLASSES: anggota bisa lihat kelas yang dia join
create policy "Anggota bisa lihat kelas yang dijoin"
  on classes for select
  using (
    exists (
      select 1 from class_members
      where class_members.class_id = classes.id
        and class_members.user_id = auth.uid()
    )
  );

-- CLASSES: siapa saja bisa select kelas by code (untuk join)
create policy "Siapa saja bisa cari kelas by code"
  on classes for select
  using (true);

-- CLASS_MEMBERS: anggota bisa join kelas
create policy "Anggota bisa join kelas"
  on class_members for insert
  with check (auth.uid() = user_id);

-- CLASS_MEMBERS: bisa lihat member kelas yang dia ikut
create policy "Bisa lihat member kelas sendiri"
  on class_members for select
  using (auth.uid() = user_id);

-- CLASS_MEMBERS: pengurus bisa lihat member kelasnya
create policy "Pengurus bisa lihat member"
  on class_members for select
  using (
    exists (
      select 1 from classes
      where classes.id = class_members.class_id
        and classes.created_by = auth.uid()
    )
  );

-- TASKS: pengurus bisa CRUD tugas di kelasnya
create policy "Pengurus bisa tambah tugas"
  on tasks for insert
  with check (
    exists (
      select 1 from classes
      where classes.id = tasks.class_id
        and classes.created_by = auth.uid()
    )
  );

create policy "Pengurus bisa update tugas"
  on tasks for update
  using (
    exists (
      select 1 from classes
      where classes.id = tasks.class_id
        and classes.created_by = auth.uid()
    )
  );

create policy "Pengurus bisa hapus tugas"
  on tasks for delete
  using (
    exists (
      select 1 from classes
      where classes.id = tasks.class_id
        and classes.created_by = auth.uid()
    )
  );

-- TASKS: semua member (pengurus + anggota) bisa lihat tugas
create policy "Member bisa lihat tugas"
  on tasks for select
  using (
    exists (
      select 1 from classes
      where classes.id = tasks.class_id
        and classes.created_by = auth.uid()
    )
    or exists (
      select 1 from class_members
      where class_members.class_id = tasks.class_id
        and class_members.user_id = auth.uid()
    )
  );

-- TASK_COMPLETIONS: anggota bisa checklist tugas
create policy "Anggota bisa checklist"
  on task_completions for insert
  with check (auth.uid() = user_id);

create policy "Anggota bisa unchecklist"
  on task_completions for delete
  using (auth.uid() = user_id);

create policy "Bisa lihat checklist sendiri"
  on task_completions for select
  using (auth.uid() = user_id);

-- Pengurus bisa lihat siapa saja yang sudah selesai
create policy "Pengurus bisa lihat checklist member"
  on task_completions for select
  using (
    exists (
      select 1 from tasks
      join classes on classes.id = tasks.class_id
      where tasks.id = task_completions.task_id
        and classes.created_by = auth.uid()
    )
  );
