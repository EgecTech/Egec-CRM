# 🚀 Universities Setup - Quick Start

**Time: 2 minutes**

---

## Step 1: Update Study Destinations (30 seconds)

```bash
npm run seed:destinations
```

**Expected output:**
```
✅ Study destinations updated
✅ University countries updated
```

---

## Step 2: Add Universities (1 minute)

```bash
npm run seed:universities
```

**Expected output:**
```
✅ Inserted 153 universities

📈 Universities per country:
   Egypt: 90 universities
   Jordan: 45 universities
   Germany: 12 universities
   Hungary: 8 universities
   United Arab Emirates: 2 universities
   Cyprus: 6 universities
```

---

## Step 3: Test (30 seconds)

1. **Login** to CRM
2. **Create Customer** → Go to Desired Program section
3. **Select Study Destination:** مصر (Egypt)
4. **Watch University Dropdown** populate with Egyptian universities ✅

---

## ✅ Done!

Now you have **153 universities** from **6 countries** ready to use!

### Countries:
- 🇪🇬 Egypt (مصر) - 90 universities
- 🇯🇴 Jordan (الأردن) - 45 universities  
- 🇩🇪 Germany (ألمانيا) - 12 universities
- 🇭🇺 Hungary (هنغاريا) - 8 universities
- 🇦🇪 UAE (الإمارات) - 2 universities
- 🇨🇾 Cyprus (قبرص) - 6 universities

---

## 🔄 Run All at Once

```bash
npm run seed:all
```

This runs all setup scripts in sequence.

---

## 📚 Full Documentation

See [UNIVERSITIES_SETUP_GUIDE.md](./UNIVERSITIES_SETUP_GUIDE.md) for complete guide.

---

**Status:** 🟢 Ready  
**Time:** ~2 minutes  
**Result:** 153 universities
