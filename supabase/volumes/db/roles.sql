-- roles.sql — set passwords for all Supabase roles using $POSTGRES_PASSWORD.
-- Runs as the last migration (99-*) so all roles already exist by this point.
-- supabase_functions_admin is omitted — only created when pg_net is present.
\set pgpass `echo "$POSTGRES_PASSWORD"`

ALTER USER authenticator        WITH PASSWORD :'pgpass';
ALTER USER pgbouncer            WITH PASSWORD :'pgpass';
ALTER USER supabase_auth_admin  WITH PASSWORD :'pgpass';
ALTER USER supabase_storage_admin WITH PASSWORD :'pgpass';
