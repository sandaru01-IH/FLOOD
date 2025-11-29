# Quick Test Checklist

## ✅ Pre-Testing Setup (Already Done!)
- ✅ Supabase credentials configured
- ✅ Environment variables set

## 🚀 Start Testing

### 1. Verify Server is Running
```bash
npm run dev
```
Should see: `Ready in XXXms` and `Local: http://localhost:3000`

### 2. Test Each Feature

#### Home Page (`http://localhost:3000`)
- [ ] Page loads without errors
- [ ] All 4 cards visible with counts
- [ ] Notification bell works
- [ ] Language toggle works
- [ ] All links work

#### Damage Assessment (`/assess`)
- [ ] Form loads
- [ ] Can complete all 5 steps
- [ ] GPS capture works (click button)
- [ ] Photo upload works
- [ ] Severity updates as you fill form
- [ ] Submit works
- [ ] Success page appears

#### Post Donation (`/gigs/new?type=donate`)
- [ ] Form loads with "Donate" selected
- [ ] Can fill all fields
- [ ] GPS capture works
- [ ] Submit works
- [ ] Redirects to `/gigs`

#### Post Collection (`/gigs/new?type=collect`)
- [ ] Form loads with "Collect" selected
- [ ] Can fill and submit

#### Browse Gigs (`/gigs`)
- [ ] List of gigs appears
- [ ] Filters work (All/Donations/Collections)
- [ ] Contact button works (opens phone dialer)

#### Live Map (`/map`)
- [ ] Map loads
- [ ] **Mobile**: Filter toggle button appears
- [ ] **Mobile**: Filters drawer slides in/out
- [ ] **Desktop**: Filters always visible
- [ ] Markers appear (if data exists)
- [ ] Clicking markers shows popup
- [ ] Filters work

#### Admin Dashboard (`/admin`)
- [ ] Login page loads
- [ ] Can login with password: `flooD123@2001`
- [ ] Dashboard shows stats
- [ ] Can verify assessments
- [ ] Can import data

### 3. Mobile Testing
Open Chrome DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M)
- [ ] Filter toggle button appears
- [ ] Filters drawer works
- [ ] All buttons are tappable
- [ ] Forms are usable

### 4. Real-Time Testing
- [ ] Open app in 2 browser windows
- [ ] Submit assessment in one
- [ ] Check if it appears in other window
- [ ] Check notification count updates

## 🐛 If You See Errors

### "Failed to load resource" or Supabase errors
1. Check Supabase project is active (not paused)
2. Verify credentials in `.env.local` are correct
3. Restart dev server: `npm run dev`

### Map not loading
- Check browser console for errors
- Verify Leaflet is loading

### Photos not uploading
- Check Supabase Storage bucket `photos` exists
- Verify bucket is public
- Check file size (max 10MB)

### Database errors
- Run migrations in Supabase SQL Editor:
  - `supabase/migrations/001_initial_schema.sql`
  - `supabase/migrations/002_gigs_schema.sql`

## 📝 Test Data to Create

1. **Assessment**: Submit a damage report
2. **Donation Gig**: Post what you can give
3. **Collection Gig**: Post what you need
4. **Verify**: Login as admin and verify the assessment

## 🎯 Expected Results

- All forms submit successfully
- Data appears on map
- Real-time updates work
- Mobile view is responsive
- Filters work on both mobile and desktop

