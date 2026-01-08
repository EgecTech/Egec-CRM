# 🚀 Quick Deploy Guide - Egec CRM

**TL;DR:** System ready. Follow these steps to deploy in 15 minutes.

---

## ✅ Pre-Deploy (2 minutes)

```bash
# 1. Check environment
npm run check:env

# 2. Build
npm run build
```

**Expected:** Both commands succeed ✅

---

## 🚀 Deploy (5 minutes)

### Vercel (Recommended)

```bash
vercel --prod
```

### Other Platform

Follow platform instructions with:
- Build: `npm run build`
- Start: `npm start`
- Port: 3000

---

## 🗄️ Post-Deploy (5 minutes)

```bash
# 1. Create indexes (connect to production DB)
npm run db:indexes

# 2. Create first superadmin
# Visit: https://your-domain.com/auth/first-superadmin
```

---

## 🧪 Test (3 minutes)

1. Login as superadmin ✅
2. Create test customer ✅
3. View customer ✅
4. Test filters ✅
5. Test search ✅

---

## 📊 Monitor

- Check Vercel dashboard
- Check MongoDB Atlas
- Watch for errors

---

## 🆘 If Issues

```bash
# Vercel rollback
vercel rollback

# Check logs
vercel logs
```

---

## 📚 Full Docs

- [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)
- [FINAL_DEPLOYMENT_REPORT.md](./FINAL_DEPLOYMENT_REPORT.md)
- [SYSTEM_TEST_GUIDE.md](./SYSTEM_TEST_GUIDE.md)

---

**Status:** 🟢 Ready to Deploy

**Time:** ~15 minutes

**Risk:** Low

**Go!** 🚀
