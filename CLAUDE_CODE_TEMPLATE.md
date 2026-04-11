# Claude Code Prompt Template — HerSafeStay

> **Use this template for ALL Claude Code prompts on this project.**
> Copy the relevant section, fill in the blanks, and paste as your prompt.

---

## Standard Prompt Structure

```
CONTEXT:
HerSafeStay — safety map app for women travelers.
Stack: Next.js 16 App Router, React 19, inline styles (no Tailwind), Supabase + PostGIS.
See ARCHITECTURE.md for full context. See SECURITY.md for security requirements.

SECURITY MANDATORY (non-negotiable):
- Enable RLS immediately after any new table creation
- SUPABASE_SERVICE_ROLE_KEY is server-side only — never NEXT_PUBLIC_
- Validate and sanitize all user inputs before database operations
- No dangerouslySetInnerHTML with user-provided content
- Parameterized queries only (Supabase client handles this automatically)
- Reference SECURITY.md Section 2 for RLS policy patterns

PERMISSION GRANTED:
[Specify what you are allowing: "make all edits", "edit only [files]", "read-only research"]

TASK:
[Describe what you want built/fixed/changed]

REQUIREMENTS:
- [Functional requirement 1]
- [Functional requirement 2]
- [Any design constraints]

SECURITY REQUIREMENTS:
[ ] RLS enabled on any new tables
[ ] Policies follow patterns in SECURITY.md Section 2
[ ] No secrets in client-side code
[ ] Input validation on any new endpoints
[ ] Verify: run RLS verification query from SECURITY.md after DB changes

FILES TO CREATE/EDIT:
[List specific files if known, or describe what files are expected]

SUCCESS CRITERIA:
- [How to know the task is done]
- [ ] Security checklist from SECURITY.md Section 3 completed (if new table)
- [ ] RLS verification query passes (if DB changes)
```

---

## Template Variants

### Variant A: New Database Table

```
CONTEXT:
HerSafeStay — safety map app for women travelers.
Stack: Next.js 16 App Router, React 19, Supabase + PostGIS.

SECURITY MANDATORY:
- Enable RLS IMMEDIATELY after CREATE TABLE
- Create appropriate policies (reference SECURITY.md Section 2)
- Run verification query from SECURITY.md after creating table

PERMISSION GRANTED: Make all edits during this session.

TASK:
Create new table: [table_name]

PURPOSE: [What this table stores and why]

DATA SENSITIVITY: [public / user-private / admin-only]
RLS PATTERN: [Pattern A/B/C/D from SECURITY.md — or let Claude choose and justify]

COLUMNS:
- [column_name] [TYPE] — [description]
- [column_name] [TYPE] — [description]

ACCESS PATTERNS:
- Public can [read/not read] this data
- Authenticated users can [insert/update/delete their own]
- Admin access via [service role in API routes]

DELIVERABLES:
1. SQL migration file at supabase/migrations/[NNN]_create_[table].sql
2. RLS enabled + policies in same migration
3. Verification query confirming RLS is active
4. Updated ARCHITECTURE.md Section 3 with new table docs

SUCCESS CRITERIA:
- [ ] Migration file created
- [ ] RLS enabled on table
- [ ] Policies match data sensitivity level
- [ ] Verification query passes (all tables show rls_enabled = true)
```

### Variant B: New API Route

```
CONTEXT:
HerSafeStay — safety map app for women travelers.
Stack: Next.js 16 App Router, React 19, Supabase + PostGIS.
API routes in app/api/*/route.js

SECURITY MANDATORY:
- Use supabase (anon client) for public data reads
- Use supabaseAdmin (service role) for writes/admin — server-side only
- Validate all query parameters and request body fields
- Return only fields needed — never SELECT * on sensitive tables

PERMISSION GRANTED: Make all edits during this session.

TASK:
Create API route: [METHOD] /api/[endpoint]

PURPOSE: [What this endpoint does]

REQUEST:
- Method: [GET/POST/PUT/DELETE]
- Query params: [param: type, description]
- Body (if POST): [field: type, required/optional, description]

RESPONSE:
- Success: [shape of response data]
- Error: [expected error cases]

CACHING:
- [Cache-Control header if applicable, or "no-cache for mutations"]

SECURITY REQUIREMENTS:
[ ] Input validation for all params/body fields
[ ] Rate limiting [if user-submission endpoint]
[ ] Uses anon client for public reads
[ ] Uses supabaseAdmin ONLY if admin operation needed (server-side)
[ ] No sensitive data in response (no emails, IPs, hashes)

DELIVERABLES:
1. app/api/[path]/route.js
2. Updated ARCHITECTURE.md Section 4 endpoint table

SUCCESS CRITERIA:
- [ ] Endpoint returns expected data
- [ ] curl test works (show command in output)
- [ ] Returns 400 for invalid inputs
- [ ] No secrets in response
```

### Variant C: New React Component

```
CONTEXT:
HerSafeStay — safety map app for women travelers.
Stack: Next.js 16 App Router, React 19, inline styles (NO Tailwind), Crimson Pro font.
Design system in MEMORY.md (coral #FF6B6B, forest green #2D6A4F).

SECURITY MANDATORY:
- No dangerouslySetInnerHTML with database content
- Validate/sanitize any user inputs in forms
- No client-side secrets

PERMISSION GRANTED: Make all edits during this session.

TASK:
Create component: [ComponentName]

PURPOSE: [What this component does and where it's used]

PROPS:
- [propName]: [type] — [description]

DESIGN:
- Follows existing inline styles pattern (see app/page.js for examples)
- Colors: coral #FF6B6B, forest green #2D6A4F, charcoal #2B2D42
- Font: Crimson Pro (var(--font-crimson-pro))
- [Any specific design requirements]

BEHAVIOR:
- [Interaction 1]
- [Interaction 2]

DELIVERABLES:
1. components/[path]/[ComponentName].jsx
2. Export from appropriate index if applicable

SUCCESS CRITERIA:
- [ ] Component renders without errors
- [ ] Follows inline styles convention (no Tailwind classes)
- [ ] No dangerouslySetInnerHTML with user content
```

### Variant D: Bug Fix

```
CONTEXT:
HerSafeStay — safety map app for women travelers.

SECURITY MANDATORY:
- Do not disable RLS or bypass security checks as a fix
- Do not expose additional data to fix a display issue
- Fix root cause, not symptoms

PERMISSION GRANTED: Make all edits needed to fix this bug.

BUG:
[Describe what's happening vs what should happen]
[Include any error messages verbatim]
[Include file:line if known]

REPRODUCTION:
1. [Step 1]
2. [Step 2]
3. [Result: X]
4. [Expected: Y]

CONSTRAINTS:
- Do not change unrelated code
- Minimal change preferred
- Do not add new dependencies unless necessary

SUCCESS CRITERIA:
- [ ] Bug no longer reproduces
- [ ] No new errors introduced
- [ ] No security regressions
- [ ] Document fix in SOLUTIONS.md if it's a non-obvious pattern
```

---

## Security Testing Commands

After any database change, run these verifications:

```bash
# 1. Check all tables have RLS (run in Supabase SQL editor)
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' ORDER BY tablename;

# 2. Test anon key access (run in terminal)
curl "https://[project].supabase.co/rest/v1/[table]" \
  -H "apikey: [anon-key]" \
  -H "Authorization: Bearer [anon-key]"
# Expect: only published/public data, not all rows

# 3. Test unauthorized write (should fail)
curl -X POST "https://[project].supabase.co/rest/v1/cities" \
  -H "apikey: [anon-key]" \
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json" \
  -d '{"id": "test", "name": "Hack"}'
# Expect: 401 or 403 error

# 4. Verify no secrets in bundle
grep -r "service_role\|SUPABASE_SERVICE_ROLE" .next/static/ 2>/dev/null
# Expect: no output (secret not in client bundle)
```

---

## Quick Reference: What NOT to Do

| Anti-Pattern | Why Dangerous | Correct Pattern |
|-------------|--------------|-----------------|
| `ALTER TABLE x DISABLE ROW LEVEL SECURITY` | Exposes all data | Fix the policy instead |
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | Exposes admin access | Server-side env var only |
| `dangerouslySetInnerHTML={{ __html: userInput }}` | XSS attack vector | `{userInput}` or DOMPurify |
| `SELECT * FROM users WHERE id = '${id}'` | SQL injection | Use Supabase client `.eq('id', id)` |
| Hardcoded API keys in source files | Key theft via git | `.env.local` + `.gitignore` |
| `{ ssr: false }` in Server Component | Next.js crash | Move to `'use client'` file |

---

*Last updated: 2026-04-11*
*Reference: SECURITY.md for full security architecture*
