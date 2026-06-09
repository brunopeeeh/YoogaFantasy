-- Add formacao column to times_usuarios for formation selection
alter table times_usuarios
add column if not exists formacao text not null default '4-4-2';
