# Deployment Guide for FloodRelief.lk

## 🚀 Quick Deployment to GitHub

### Step 1: Install Git (if not installed)

**Windows:**
1. Download from: https://git-scm.com/download/win
2. Install with default settings
3. Restart your terminal/PowerShell

**Verify installation:**
```bash
git --version
```

### Step 2: Initialize Git Repository

```bash
# Navigate to project directory
cd "E:\Work\Business\AlphaGrid\Flood Post Assessing System"

# Initialize git (if not already done)
git init

# Check status
git status
```

### Step 3: Create GitHub Repository

1. Go to https://github.com
2. Click the "+" icon → "New repository"
3. Name it: `flood-relief-lk` (or your preferred name)
4. Description: "Flood damage assessment and relief system for Sri Lanka"
5. Choose: **Public** (or Private if you prefer)
6. **DO NOT** initialize with README, .gitignore, or license
7. Click "Create repository"

### Step 4: Add Files and Commit

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: FloodRelief.lk - Complete flood assessment and relief system"

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/flood-relief-lk.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 5: Verify on GitHub

1. Go to your repository on GitHub
2. Verify all files are uploaded
3. Check that `.env.local` is **NOT** in the repository

## 🔐 Important: Environment Variables

**NEVER commit `.env.local` to GitHub!**

The `.gitignore` file already excludes it, but double-check:
- `.env.local` should NOT appear in `git status`
- If it does, remove it: `git rm --cached .env.local`

## 📝 Next Steps: Deploy to Vercel

After pushing to GitHub:

1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your `flood-relief-lk` repository
5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
6. Click "Deploy"

Your app will be live in ~2 minutes! 🎉

## 🐛 Troubleshooting

### "git is not recognized"
- Install Git from https://git-scm.com/download/win
- Restart terminal after installation

### "Permission denied"
- Make sure you're logged into GitHub
- Use HTTPS or set up SSH keys

### "Repository not found"
- Check repository name matches
- Verify you have access to the repository

### Files not uploading
- Check `.gitignore` isn't excluding needed files
- Use `git add -f filename` to force add if needed

## 📚 Git Commands Reference

```bash
# Check status
git status

# Add files
git add .
git add specific-file.txt

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# View commit history
git log

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

## ✅ Pre-Deployment Checklist

- [ ] Git is installed
- [ ] `.env.local` is in `.gitignore`
- [ ] All code is committed
- [ ] GitHub repository is created
- [ ] Code is pushed to GitHub
- [ ] Environment variables are documented (in README or separate file)
- [ ] Build works locally (`npm run build`)

---

**Ready to deploy? Follow the steps above!** 🚀

