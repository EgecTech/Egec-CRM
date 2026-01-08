# 🔐 VERCEL ENVIRONMENT VARIABLES SETUP

**Issue:** Build failed due to missing environment variables.

**Status:** ⏳ WAITING FOR USER ACTION

---

## 📋 Required Environment Variables

### ✅ Method 1: Via Vercel Dashboard (Recommended)

1. **Open Vercel Dashboard:**
   ```
   🔗 https://vercel.com/egectech/egec-crm/settings/environment-variables
   ```

2. **Add each variable:**

   Click **"Add Variable"** for each of these:

   | Variable Name | Where to get it | Example |
   |---------------|-----------------|---------|
   | `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://username:password@cluster.mongodb.net/egec_crm` |
   | `NEXTAUTH_URL` | Your production URL | `https://egec-crm.vercel.app` or your custom domain |
   | `NEXTAUTH_SECRET` | Random secret key | Generate: `openssl rand -base64 32` |
   | `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard | Your cloud name |
   | `CLOUDINARY_API_KEY` | Cloudinary Dashboard | Your API key |
   | `CLOUDINARY_API_SECRET` | Cloudinary Dashboard | Your API secret |

3. **Environment Selection:**
   - ✅ **Production** (Required)
   - ✅ **Preview** (Recommended)
   - ✅ **Development** (Optional)

4. **Save** and click **"Redeploy"**

---

## 🚀 Method 2: Via Vercel CLI (Advanced)

### Step 1: Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Link Project
```bash
vercel link
```

### Step 4: Add Environment Variables
```bash
# MongoDB
vercel env add MONGODB_URI production
# Paste your MongoDB URI when prompted

# NextAuth URL
vercel env add NEXTAUTH_URL production
# Enter: https://egec-crm.vercel.app (or your domain)

# NextAuth Secret
vercel env add NEXTAUTH_SECRET production
# Paste your secret key

# Cloudinary Cloud Name
vercel env add CLOUDINARY_CLOUD_NAME production
# Paste your cloud name

# Cloudinary API Key
vercel env add CLOUDINARY_API_KEY production
# Paste your API key

# Cloudinary API Secret
vercel env add CLOUDINARY_API_SECRET production
# Paste your API secret
```

### Step 5: Redeploy
```bash
vercel --prod
```

---

## 📝 How to Get Your Values

### 1. MONGODB_URI
From your local `.env` file or MongoDB Atlas:
- Go to: https://cloud.mongodb.com
- Click: **Connect** → **Connect your application**
- Copy connection string
- Replace `<password>` with your password
- Add `/egec_crm` at the end

Example:
```
mongodb+srv://username:password@cluster.mongodb.net/egec_crm?retryWrites=true&w=majority
```

### 2. NEXTAUTH_URL
Your Vercel deployment URL:
```
https://egec-crm.vercel.app
```
Or your custom domain if you have one.

### 3. NEXTAUTH_SECRET
Generate a random secret:
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use this online:
# https://generate-secret.vercel.app/32
```

### 4. Cloudinary Credentials
- Go to: https://cloudinary.com/console
- **Cloud Name:** Top-left corner
- **API Key & Secret:** Account Details section

---

## ⚙️ Environment Variables Summary

```env
# Required for build
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=https://egec-crm.vercel.app
NEXTAUTH_SECRET=your-secret-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-secret-here

# Optional (for caching)
REDIS_URL=redis://...  # Optional

# Auto-set by Vercel
NODE_ENV=production    # Vercel sets this automatically
```

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Use strong, random values for secrets
- ✅ Add all environments (Production, Preview, Development)
- ✅ Keep `.env` file local (never commit to Git)
- ✅ Rotate secrets regularly

### ❌ DON'T:
- ❌ Share secrets publicly
- ❌ Commit `.env` to Git
- ❌ Use the same secrets for dev and production
- ❌ Use weak/simple secrets

---

## 🎯 After Adding Variables

### Vercel will automatically:
1. ✅ Detect new environment variables
2. ✅ Trigger a new deployment
3. ✅ Build should succeed

### Or manually trigger:
1. Go to: https://vercel.com/egectech/egec-crm/deployments
2. Click latest deployment
3. Click **"Redeploy"**

---

## 🧪 Testing After Deployment

Once build succeeds:

1. **Visit your site:**
   ```
   https://egec-crm.vercel.app
   ```

2. **Test login:**
   - Should connect to MongoDB ✅
   - Should authenticate users ✅
   - Should load system settings ✅

3. **Test dropdowns:**
   - Study Destination → 6 countries ✅
   - Desired University → 153 universities ✅
   - Desired College → Colleges per university ✅

---

## 🐛 Common Issues

### Issue 1: "NEXTAUTH_URL must be a valid URL"
**Solution:** Make sure it starts with `https://` and has no trailing slash.
```
❌ egec-crm.vercel.app
❌ https://egec-crm.vercel.app/
✅ https://egec-crm.vercel.app
```

### Issue 2: "Invalid MongoDB URI"
**Solution:** Check that:
- Username/password are correct
- Special characters in password are URL-encoded
- Database name is included: `/egec_crm`

### Issue 3: "Cloudinary credentials invalid"
**Solution:** 
- Copy from Cloudinary dashboard directly
- No quotes or spaces
- API Secret is different from API Key

---

## 📊 Deployment Checklist

Before deploying:

- [ ] All 6 required variables added in Vercel
- [ ] Values copied correctly (no extra spaces)
- [ ] All environments selected (Production ✅)
- [ ] MongoDB connection string includes database name
- [ ] NEXTAUTH_URL matches your Vercel domain
- [ ] Cloudinary credentials are from the correct account

After deploying:

- [ ] Build succeeds (no errors)
- [ ] Site loads correctly
- [ ] Login works
- [ ] Database connection works
- [ ] Image uploads work (Cloudinary)
- [ ] All dropdowns work

---

## 🚀 Quick Summary

**Action Required:**
1. Open Vercel Dashboard → Environment Variables
2. Add 6 required variables (copy from your local `.env`)
3. Save and Redeploy
4. Wait 2-3 minutes for build
5. ✅ Done!

**Link:**
🔗 https://vercel.com/egectech/egec-crm/settings/environment-variables

---

## ⏱️ Expected Time

- **Adding variables:** 5 minutes
- **Redeployment:** 2-3 minutes
- **Total:** ~10 minutes

---

**Status:** ⏳ Waiting for environment variables to be added in Vercel Dashboard
