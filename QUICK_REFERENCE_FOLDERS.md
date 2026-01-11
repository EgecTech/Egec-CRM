# 📁 Quick Reference: Folder Organization

**Last Updated:** 2026-01-10

---

## 🎯 WHERE TO PUT FILES

### 🚀 Production Scripts → `scripts/production/`
**Deployed:** ✅ YES  
**For:** Essential setup scripts  
**Examples:**
- Seeding scripts (universities, system settings)
- Database indexing
- Initial data setup

---

### 🔧 Maintenance Scripts → `scripts/maintenance/`
**Deployed:** ✅ YES  
**For:** Optional update/maintenance scripts  
**Examples:**
- Update university data
- Update field options
- Verify data integrity
- Import external data

---

### 🧪 Test Scripts → `dev/testing/`
**Deployed:** ❌ NO  
**For:** Testing, debugging, performance testing  
**Examples:**
- testApiResponse.js
- testQueryPerformance.js
- generateTestCustomers.js
- checkLatestStatus.js

---

### 📚 Development Docs → `dev/docs/`
**Deployed:** ❌ NO  
**For:** Technical documentation, specs, analysis  
**Examples:**
- BACKEND_TECHNOLOGY_STACK.md
- PERFORMANCE_TESTING_1M_CUSTOMERS.md
- SECURITY_AUDIT_REPORT.md
- Feature specifications

---

### 🎨 Diagrams → `dev/diagrams/`
**Deployed:** ❌ NO  
**For:** Visual diagrams, flowcharts, mockups  
**Examples:**
- customer-degree-diagrams.html
- ER diagrams (HTML/image)
- System flowcharts
- UI mockups

---

### 🗂️ Old Migrations → `dev/migrations/`
**Deployed:** ❌ NO  
**For:** One-time migration scripts (archive)  
**Examples:**
- migrateAssignedAgents.js
- migrateLatestCounselorStatus.js
- fixDatabaseStructure.js

---

### 📝 Notes → `dev/notes/`
**Deployed:** ❌ NO  
**For:** Temporary notes, research, ideas  
**Examples:**
- feature-ideas.md
- bug-investigation.md
- meeting-notes.md

---

### 📖 User Documentation → `docs/`
**Deployed:** ✅ YES  
**For:** User-facing documentation  
**Examples:**
- README.md
- CRM_GUIDE.md
- DEPLOYMENT_READY.md
- ER diagrams (for reference)

---

## 🔐 SECURITY RULES

| Folder | Git | Deploy | Sensitive Data OK? |
|--------|-----|--------|--------------------|
| `dev/` | ❌ NO | ❌ NO | ✅ YES (safe) |
| `scripts/production/` | ✅ YES | ✅ YES | ❌ NO |
| `scripts/maintenance/` | ✅ YES | ✅ YES | ❌ NO |
| `docs/` | ✅ YES | ✅ YES | ❌ NO |
| Application code | ✅ YES | ✅ YES | ❌ NO |

---

## 📊 QUICK DECISION TREE

```
Is this a script?
├─ YES → Is it essential for setup?
│        ├─ YES → scripts/production/
│        └─ NO → Is it for maintenance?
│                 ├─ YES → scripts/maintenance/
│                 └─ NO → Is it for testing?
│                          ├─ YES → dev/testing/
│                          └─ NO → dev/notes/
│
└─ NO → Is it documentation?
         ├─ YES → Is it for end users?
         │        ├─ YES → docs/
         │        └─ NO → dev/docs/
         │
         └─ NO → Is it a diagram?
                  ├─ YES → dev/diagrams/
                  └─ NO → Is it temporary?
                           ├─ YES → dev/notes/
                           └─ NO → dev/migrations/ (if old migration)
```

---

## 🎯 EXAMPLES

### ✅ CORRECT

```bash
# Production seeding script
scripts/production/seedNewData.js

# Maintenance update script
scripts/maintenance/updateNewField.js

# Test script
dev/testing/test-new-api.js

# Development documentation
dev/docs/features/new-feature-spec.md

# User documentation
docs/USER_GUIDE.md

# Diagram
dev/diagrams/system-flow.html

# Temporary notes
dev/notes/ideas-2026-01.md
```

### ❌ INCORRECT

```bash
# ❌ Test script in production folder
scripts/production/testApiResponse.js

# ❌ Development doc in user docs
docs/TECHNICAL_ARCHITECTURE_DEEP_DIVE.md

# ❌ Production script in dev folder
dev/testing/seedSystemSettings.js

# ❌ Diagram in docs folder
docs/customer-degree-diagrams.html
```

---

## 🚀 NPM SCRIPTS CHEAT SHEET

### Production Setup
```bash
npm run seed:all                    # Complete setup (recommended)
npm run seed:crm                    # System settings only
npm run seed:all-universities       # All universities
npm run db:indexes                  # Database indexes
```

### Maintenance
```bash
npm run update:universities         # Update university data
npm run update:destinations         # Update study destinations
npm run update:times                # Update study times
npm run update:sources              # Update lead sources
npm run verify:destinations         # Verify data integrity
```

---

## 💡 TIPS

1. **When in doubt** → Put it in `dev/`
2. **If it's for testing** → `dev/testing/`
3. **If it's temporary** → `dev/notes/`
4. **If it's production** → `scripts/production/` or `scripts/maintenance/`
5. **If it's documentation** → `dev/docs/` (technical) or `docs/` (user)

---

**Remember:** Everything in `dev/` is safe and NEVER deployed! 🔒
