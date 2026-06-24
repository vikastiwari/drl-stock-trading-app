# Known Bugs & Issues Tracker

This document tracks known bugs, dependency conflicts, and architectural debt for the DRL Stock Trading App.

## Open Issues

### 1. Dependency Conflict: `google-genai` vs `supabase`
- **Date Discovered**: June 2026
- **Component**: Backend (`requirements.txt`)
- **Description**: The `google-genai` SDK installs newer versions of `httpx` (0.28.1) and `websockets` (16.0). The `supabase` client (v2.4.5) requires strict older versions (`httpx<0.28` and `websockets<13`). Pip successfully installed the packages but threw a dependency resolution warning.
- **Impact**: Low right now, as we aren't actively calling Supabase APIs in the hot path. However, when we implement full database authentication and telemetry storage in Supabase, this could cause runtime errors.
- **Potential Fix**: 
  1. Wait for `supabase-py` to release a version supporting `httpx>=0.28`.
  2. Pin `httpx==0.27.2` and see if `google-genai` still functions with the slightly older version.

## Closed Issues
*(None yet)*
