#!/bin/bash
# 00-create-roles.sh
# Runs as an initdb script before migrate.sh (alphabetically "00-..." < "migrate.sh").
#
# migrate.sh connects as supabase_admin to run the Supabase init-scripts, but
# supabase_admin doesn't exist yet at that point. This script pre-creates ONLY
# supabase_admin so migrate.sh can authenticate. All other roles (anon, authenticated,
# authenticator, service_role, supabase_auth_admin, etc.) are created by the
# image's own init-scripts/00000000000000-initial-schema.sql.

set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE ROLE supabase_admin
    SUPERUSER CREATEROLE CREATEDB REPLICATION BYPASSRLS LOGIN
    PASSWORD '$POSTGRES_PASSWORD';
EOSQL
