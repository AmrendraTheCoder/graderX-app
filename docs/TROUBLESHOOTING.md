# GraderX Troubleshooting Guide

## Common Issues and Solutions

### 1. "An unexpected error occurred" / 500 Internal Server Error

**Symptoms:**

- Application shows "An unexpected error occurred" message
- Browser console shows 500 Internal Server Error
- JavaScript files fail to load with MIME type errors

**Root Causes:**

1. **TypeScript Compilation Errors**: Form actions returning incorrect types
2. **Missing Environment Variables**: Supabase connection not configured
3. **Database Not Running**: Supabase local development environment down
4. **Migration Issues**: Database schema not properly applied

**Solutions:**

#### A. Fix TypeScript Errors

```bash
# Check for TypeScript compilation errors
npx tsc --noEmit

# Common fix: Ensure form actions return void or use redirect()
# ❌ Wrong:
export const myAction = async () => {
  return { error: "message" }; // Invalid for form actions
};

# ✅ Correct:
export const myAction = async () => {
  return encodedRedirect("error", "/path", "message");
};
```

#### B. Set Up Environment Variables

```bash
# Create environment variables for local development
export NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
export NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Or use the provided startup script
./start-dev.sh
```

#### C. Start Supabase

```bash
# Check if Docker is running
docker --version

# Start Docker Desktop if not running
open -a Docker

# Start Supabase local development
supabase start

# If containers are stuck, reset them
supabase stop
supabase start
```

#### D. Fix Database Migrations

```bash
# Reset database with all migrations
supabase db reset

# If migration files have naming issues:
# Ensure all files follow pattern: YYYYMMDDHHMMSS_name.sql
# Example: 20240322000001_initial_setup.sql
```

### 2. Database Connection Issues

**Symptoms:**

- Authentication redirects to sign-in page
- Database queries fail
- "Cannot connect to database" errors

**Solutions:**

```bash
# Check Supabase status
supabase status

# Verify database is accessible
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Reset database if corrupted
supabase db reset
```

### 3. Migration Syntax Errors

**Common Issues:**

- `DO $` blocks should be `DO $$`
- Missing semicolons
- Invalid SQL syntax

**Fix:**

```sql
-- ❌ Wrong:
DO $
BEGIN
    -- code
END $;

-- ✅ Correct:
DO $$
BEGIN
    -- code
END $$;
```

### 4. Port Conflicts

**Symptoms:**

- Server fails to start on port 3000
- "Port already in use" errors

**Solutions:**

```bash
# Find what's using port 3000
lsof -i :3000

# Kill processes using the port
pkill -f "next dev"

# Or use a different port
npm run dev -- -p 3001
```

## Quick Recovery Steps

### Complete Reset (Nuclear Option)

```bash
# 1. Stop all services
pkill -f "next dev"
supabase stop

# 2. Clear caches
rm -rf .next
rm -rf node_modules
npm install

# 3. Restart services
supabase start
supabase db reset

# 4. Start development server
./start-dev.sh
```

### Environment Setup Checklist

- [ ] Docker Desktop is running
- [ ] Supabase is started (`supabase status`)
- [ ] Environment variables are set
- [ ] Database migrations applied successfully
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Next.js development server starts on port 3000

## Useful Commands

```bash
# Check all services
supabase status
ps aux | grep next
lsof -i :3000

# View logs
# Supabase logs are in Docker containers
docker logs supabase_db_graderx

# Next.js logs are in terminal where you ran npm run dev

# Database access
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Supabase Studio (Database GUI)
open http://127.0.0.1:54323
```

## Prevention

1. **Always use the startup script**: `./start-dev.sh`
2. **Check TypeScript before committing**: `npx tsc --noEmit`
3. **Test migrations before applying**: Review SQL syntax
4. **Keep Docker running**: Supabase requires Docker
5. **Use proper form action patterns**: Always return void or redirect

## Getting Help

If issues persist:

1. Check the terminal output for specific error messages
2. Verify all environment variables are set correctly
3. Ensure Docker has sufficient resources allocated
4. Try the complete reset procedure above
5. Check Supabase documentation for local development setup
