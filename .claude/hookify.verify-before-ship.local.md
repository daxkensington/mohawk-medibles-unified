---
name: verify-before-ship
enabled: true
event: stop
pattern: .*
action: warn
---

**OMMAE Ship Checklist — Verify Before Claiming Done**

Before stopping, confirm:
- [ ] `npm run build` passes with zero errors
- [ ] No uncommitted changes (`git status` clean)
- [ ] Security checks: no hardcoded secrets, AUTH_SECRET guard present
- [ ] All modified files have backups in `.backups/`
- [ ] Changes pushed to fork (`git push fork main`)

If deploying to production, run `bash scripts/pre-deploy.sh` first.
