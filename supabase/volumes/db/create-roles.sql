-- 00-create-roles.sql
-- Creates all Supabase-required roles for local self-hosted development.
-- This must run before migrate.sh (files run alphabetically; digits before letters).
-- Roles are expected by GoTrue (supabase_auth_admin), PostgREST (authenticator),
-- and the Supabase postgres image's own migrate.sh (supabase_admin).

\set pgpass `echo "$POSTGRES_PASSWORD"`

-- ── Privileged admin roles ─────────────────────────────────────────────────
CREATE ROLE supabase_admin SUPERUSER CREATEROLE CREATEDB REPLICATION BYPASSRLS LOGIN;
ALTER  USER  supabase_admin WITH PASSWORD :'pgpass';

CREATE ROLE supabase_auth_admin      NOINHERIT CREATEROLE LOGIN NOREPLICATION;
ALTER  USER  supabase_auth_admin     WITH PASSWORD :'pgpass';

CREATE ROLE supabase_storage_admin   NOINHERIT CREATEROLE LOGIN NOREPLICATION;
ALTER  USER  supabase_storage_admin  WITH PASSWORD :'pgpass';

CREATE ROLE supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
ALTER  USER  supabase_functions_admin WITH PASSWORD :'pgpass';

CREATE ROLE supabase_replication_admin LOGIN REPLICATION;
ALTER  USER  supabase_replication_admin WITH PASSWORD :'pgpass';

-- ── Non-login roles (schema-level permissions) ────────────────────────────
CREATE ROLE supabase_realtime_admin NOLOGIN NOINHERIT;
CREATE ROLE anon                    NOLOGIN NOINHERIT;
CREATE ROLE authenticated           NOLOGIN NOINHERIT;
CREATE ROLE service_role            NOLOGIN NOINHERIT BYPASSRLS;

-- ── PostgREST connection role ─────────────────────────────────────────────
CREATE ROLE authenticator NOINHERIT LOGIN;
ALTER  USER  authenticator WITH PASSWORD :'pgpass';

GRANT anon              TO authenticator;
GRANT authenticated     TO authenticator;
GRANT service_role      TO authenticator;
GRANT supabase_admin    TO authenticator;

-- ── PgBouncer ─────────────────────────────────────────────────────────────
CREATE ROLE pgbouncer NOLOGIN;
ALTER  USER  pgbouncer WITH PASSWORD :'pgpass';
