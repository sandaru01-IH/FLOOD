# Testing Guide for FloodRelief.lk

## Quick Start Testing

### Step 1: Set Up Supabase (If Not Done)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Sign up/login
   - Click "New Project"
   - Choose a name and database password
   - Select a region close to you
   - Wait for project to be created (2-3 minutes)

2. **Run Database Migrations**
   - In Supabase dashboard, go to **SQL Editor**
   - Click **New Query**
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Click **Run** (or press Ctrl+Enter)
   - Wait for success message
   - Repeat for `supabase/migrations/002_gigs_schema.sql`

3. **Create Storage Bucket**
   - Go to **Storage** in Supabase dashboard
   - Click **Create bucket**
   - Name: `photos`
   - Make it **Public**
   - Click **Create bucket**
   - Go to **Policies** tab
   - Click **New Policy** → **For full customization**
   - Name: "Public upload"
   - Policy: `true` for INSERT and SELECT
   - Save

4. **Get Your Credentials**
   - Go to **Project Settings** → **API**
   - Copy:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon public** key
     - **service_role** key (keep this secret!)

### Step 2: Configure Environment Variables

1. Create `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ADMIN_PASSWORD=test123
```

2. Replace the values with your actual Supabase credentials

### Step 3: Start the Development Server

```bash
npm run dev
```

The app should be running at http://localhost:3000

## Testing Checklist

### ✅ Home Page
- [ ] All 4 main cards are visible
- [ ] Count badges show on cards (may show 0 initially)
- [ ] Notification bell appears in header
- [ ] Language toggle works
- [ ] All links navigate correctly

### ✅ Damage Assessment Form (`/assess`)
- [ ] Form loads with step indicator
- [ ] Can navigate through all 5 steps
- [ ] GPS location capture works (click "Capture GPS Location")
- [ ] Photo upload works (add 1-3 photos)
- [ ] Severity score updates in real-time
- [ ] Can submit form successfully
- [ ] Redirects to success page

### ✅ Gig Marketplace (`/gigs`)
- [ ] Can see list of gigs (empty initially)
- [ ] Filter buttons work (All, Donations, Collections)
- [ ] Can click "Post a Gig" button

### ✅ Post Donation Gig (`/gigs/new?type=donate`)
- [ ] Form loads with "Donate" pre-selected
- [ ] Can select user type (Individual, NGO, Organization)
- [ ] Can select multiple supplies
- [ ] Can enter quantity description
- [ ] GPS location capture works
- [ ] Can submit successfully
- [ ] Redirects to `/gigs` page
- [ ] New gig appears in list

### ✅ Post Collection Gig (`/gigs/new?type=collect`)
- [ ] Form loads with "Collect" pre-selected
- [ ] All fields work correctly
- [ ] Can submit successfully

### ✅ Live Map (`/map`)
- [ ] Map loads with Sri Lanka centered
- [ ] Filter toggle button appears on mobile
- [ ] Filters panel slides in/out on mobile
- [ ] Filters work on desktop (always visible)
- [ ] Can see assessment markers (if any exist)
- [ ] Can see gig markers (if any exist)
- [ ] Clicking markers shows popup
- [ ] Legend is visible

### ✅ Admin Dashboard (`/admin`)
- [ ] Can access `/admin/login`
- [ ] Can login with password from `.env.local`
- [ ] Dashboard shows statistics
- [ ] Charts render correctly
- [ ] Can navigate to Verify page
- [ ] Can verify/unverify assessments
- [ ] Can import GeoJSON data

### ✅ Mobile Testing
- [ ] Test on mobile device or browser dev tools (mobile view)
- [ ] Filter toggle button appears
- [ ] Filters drawer slides smoothly
- [ ] All buttons are easy to tap (44px minimum)
- [ ] Forms are easy to fill on mobile
- [ ] Map is usable on mobile

## Test Data Creation

### Create Test Assessment
1. Go to `/assess`
2. Fill out the form:
   - Name: "Test User"
   - Phone: "0712345678"
   - Family Size: 4
   - Water inside: Yes
   - Can stay home: No
   - Electricity: Not working
   - Select some damaged items
   - Mark special needs if needed
   - Capture GPS location
   - Submit

### Create Test Donation Gig
1. Go to `/gigs/new?type=donate`
2. Fill out:
   - Name: "Test Donor"
   - Phone: "0712345679"
   - Select supplies (Food, Water)
   - Quantity: "50 packets"
   - Capture location
   - Submit

### Create Test Collection Gig
1. Go to `/gigs/new?type=collect`
2. Fill out similar to donation
3. Submit

## Common Issues & Solutions

### Issue: "Failed to load resource" errors
**Solution**: Check that Supabase URL and keys are correct in `.env.local`

### Issue: Photos not uploading
**Solution**: 
- Verify `photos` bucket exists and is public
- Check bucket policies allow uploads
- Check file size (max 10MB)

### Issue: Map not loading
**Solution**:
- Check browser console for errors
- Verify Leaflet CSS is loading
- Try refreshing the page

### Issue: Real-time updates not working
**Solution**:
- In Supabase, go to Database → Replication
- Enable replication for `assessments` and `gigs` tables

### Issue: Admin login not working
**Solution**:
- Check `ADMIN_PASSWORD` in `.env.local`
- Restart dev server after changing `.env.local`
- Clear browser cookies

## Testing Real-Time Features

1. Open the app in two browser windows
2. Submit a new assessment in one window
3. Check if it appears in the other window automatically
4. Check if notification count updates

## Performance Testing

- Test with slow 3G connection (Chrome DevTools → Network → Throttling)
- Test form submission with poor connectivity
- Verify images load progressively

## Browser Compatibility

Test on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (if on Mac)
- Mobile browsers (Chrome, Safari)

## Next Steps After Testing

Once testing is complete:
1. Fix any bugs found
2. Add more translations (Sinhala/Tamil)
3. Deploy to production (Vercel recommended)
4. Set up production Supabase project
5. Configure production environment variables

