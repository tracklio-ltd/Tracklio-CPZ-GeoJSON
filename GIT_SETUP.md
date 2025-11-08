# Git Setup Troubleshooting

## Issue: 403 Permission Denied

**Error:** `Permission to tracklio-ltd/Tracklio-CPZ-GeoJSON.git denied to beth-codes`

**Cause:** The GitHub account `beth-codes` doesn't have push access to the `tracklio-ltd` organization repository.

## Solutions

### Option 1: Get Added as Collaborator (Recommended)

Ask a repository admin to:
1. Go to repository settings
2. Add `beth-codes` as a collaborator with write access
3. Then try pushing again

### Option 2: Use SSH Instead of HTTPS

If you have SSH keys set up:

```bash
# Change remote to SSH
git remote set-url origin git@github.com:tracklio-ltd/Tracklio-CPZ-GeoJSON.git

# Try pushing again
git push -u origin main
```

### Option 3: Use Personal Access Token

1. Create a Personal Access Token (PAT) on GitHub:
   - Go to Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` scope
   - Copy the token

2. Use token in URL:
```bash
git remote set-url origin https://[TOKEN]@github.com/tracklio-ltd/Tracklio-CPZ-GeoJSON.git
git push -u origin main
```

### Option 4: Use GitHub CLI

```bash
# Authenticate with GitHub CLI
gh auth login

# Then push
git push -u origin main
```

### Option 5: Check Organization Access

Make sure:
- You're a member of the `tracklio-ltd` organization
- You have write access to the repository
- You're authenticated with the correct GitHub account

## Current Status

- **Remote:** `https://github.com/tracklio-ltd/Tracklio-CPZ-GeoJSON.git`
- **Git User:** `elizabeth.adegunwa`
- **Git Email:** `Adegunwaanu@gmail.com`
- **GitHub Account:** `beth-codes` (needs permission)

## Quick Fix

If you have admin access, add yourself as a collaborator, then:

```bash
git push -u origin main
```

