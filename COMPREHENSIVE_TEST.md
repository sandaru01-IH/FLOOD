# Comprehensive System Testing Guide

## Testing Tools Available

### 1. **Automated Test Suite** (`/test`)
   - Access: http://localhost:3000/test
   - Runs comprehensive tests automatically
   - Tests connectivity, database, APIs, real-time features
   - Shows detailed results with timestamps

### 2. **Debug Console** (`/debug`)
   - Access: http://localhost:3000/debug
   - Real-time console log monitoring
   - System information display
   - Database query testing

### 3. **Command Line Tests**
   ```bash
   npm run test
   ```
   - Tests Supabase connectivity
   - Validates database structure
   - Quick health check

## Complete Testing Checklist

### Phase 1: Infrastructure Testing

#### ✅ Database Setup
- [ ] Run migration `001_initial_schema.sql` - Check for errors
- [ ] Run migration `002_gigs_schema.sql` - Check for errors
- [ ] Verify all tables exist:
  - [ ] `assessments`
  - [ ] `gigs`
  - [ ] `helpers`
  - [ ] `matches`
  - [ ] `context_layers`
  - [ ] `admin_sessions`
- [ ] Verify PostGIS extension is enabled
- [ ] Check RLS policies are active

#### ✅ Storage Setup
- [ ] `photos` bucket exists
- [ ] Bucket is public
- [ ] Upload policy allows INSERT
- [ ] Test upload a small image manually

#### ✅ Environment Configuration
- [ ] `.env.local` file exists
- [ ] All required variables are set:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `ADMIN_PASSWORD`
- [ ] No typos in variable names
- [ ] Values are correct (not placeholder text)

### Phase 2: Functional Testing

#### ✅ Home Page (`/`)
- [ ] Page loads without errors
- [ ] All 4 main cards display
- [ ] Count badges show (may be 0 initially)
- [ ] Notification bell appears
- [ ] Language toggle works (3 languages)
- [ ] All navigation links work
- [ ] Critical cases card appears if count > 0
- [ ] Responsive on mobile (test with DevTools)

#### ✅ Damage Assessment Form (`/assess`)
- [ ] Form loads with step indicator
- [ ] Step 1: Basic Info
  - [ ] Name field required validation
  - [ ] Phone validation (10 digits)
  - [ ] Family size accepts numbers
- [ ] Step 2: Damage
  - [ ] Radio buttons work (water inside, can stay home, electricity)
  - [ ] Checkboxes for damaged items work
  - [ ] Severity score updates in real-time
- [ ] Step 3: Special Needs
  - [ ] Checkboxes work (elderly, children, sick)
  - [ ] Notes field accepts text
- [ ] Step 4: Location
  - [ ] GPS button requests permission
  - [ ] Location captured successfully
  - [ ] Area field accepts text
  - [ ] Photo upload works (1-3 images)
  - [ ] Can remove uploaded photos
- [ ] Step 5: Review
  - [ ] Shows all entered data
  - [ ] Submit button works
- [ ] Submission
  - [ ] Success page appears
  - [ ] Reference ID shown
  - [ ] Data appears in database
  - [ ] Photos uploaded to storage

#### ✅ Gig Marketplace (`/gigs`)
- [ ] List page loads
- [ ] Filter buttons work (All, Donations, Collections)
- [ ] Empty state shows when no gigs
- [ ] Gig cards display correctly when data exists
- [ ] Contact button opens phone dialer
- [ ] Map link works
- [ ] Real-time updates (open in 2 windows)

#### ✅ Post Donation Gig (`/gigs/new?type=donate`)
- [ ] Form loads with "Donate" pre-selected
- [ ] User type selection works
- [ ] Supply checkboxes work
- [ ] Quantity field accepts text
- [ ] Description field works
- [ ] GPS capture works
- [ ] Delivery options work
- [ ] Submit creates gig in database
- [ ] Redirects to `/gigs`

#### ✅ Post Collection Gig (`/gigs/new?type=collect`)
- [ ] Form loads with "Collect" pre-selected
- [ ] All fields work
- [ ] Pickup option works
- [ ] Submit works

#### ✅ Live Map (`/map`)
- [ ] Map loads (Sri Lanka centered)
- [ ] OpenStreetMap tiles load
- [ ] **Desktop:**
  - [ ] Filters sidebar always visible
  - [ ] All filter controls work
- [ ] **Mobile:**
  - [ ] Filter toggle button appears
  - [ ] Drawer slides in/out smoothly
  - [ ] Overlay appears when open
  - [ ] Close button works
- [ ] Markers appear for assessments
- [ ] Markers appear for gigs
- [ ] Clicking marker shows popup
- [ ] Popup shows correct data
- [ ] Filters affect visible markers
- [ ] Legend displays correctly
- [ ] Real-time updates work

#### ✅ Admin Dashboard (`/admin`)
- [ ] Login page loads
- [ ] Can login with correct password
- [ ] Dashboard shows:
  - [ ] Stats cards with numbers
  - [ ] Severity distribution chart
  - [ ] Needs summary
  - [ ] District/Area heatmap
  - [ ] High priority list
- [ ] Verify page shows assessments
- [ ] Can verify/unverify assessments
- [ ] Data import page loads
- [ ] Can import GeoJSON file

### Phase 3: Integration Testing

#### ✅ API Endpoints
- [ ] `POST /api/submit-assessment` - Creates assessment
- [ ] `POST /api/submit-gig` - Creates gig
- [ ] `GET /api/stats` - Returns statistics
- [ ] `GET /api/get-matches` - Returns matches
- [ ] `POST /api/import-data` - Imports context layer
- [ ] `POST /api/admin/login` - Admin authentication
- [ ] `GET /api/admin/check` - Session validation
- [ ] `POST /api/admin/logout` - Session cleanup

#### ✅ Real-Time Features
- [ ] Open app in 2 browser windows
- [ ] Submit assessment in Window 1
- [ ] Check if appears in Window 2 map
- [ ] Check if notification updates
- [ ] Submit gig in Window 1
- [ ] Check if appears in Window 2

#### ✅ Data Flow
- [ ] Assessment → Database → Map marker
- [ ] Gig → Database → Map marker
- [ ] Photo upload → Storage → URL in database
- [ ] Admin verify → Database update → Map update

### Phase 4: Error Handling Testing

#### ✅ Form Validation
- [ ] Required fields show errors
- [ ] Invalid phone number rejected
- [ ] Invalid email format rejected
- [ ] Missing location prevents submission
- [ ] File size limits enforced

#### ✅ Network Errors
- [ ] Test with network throttling (slow 3G)
- [ ] Test offline behavior
- [ ] Test timeout scenarios
- [ ] Error messages are user-friendly

#### ✅ Edge Cases
- [ ] Submit form with no photos
- [ ] Submit form with max photos (3)
- [ ] Submit with special characters in text
- [ ] Submit with very long text
- [ ] GPS permission denied
- [ ] Invalid file type uploaded

### Phase 5: Performance Testing

#### ✅ Load Times
- [ ] Home page loads < 2 seconds
- [ ] Map loads < 3 seconds
- [ ] Forms load < 1 second
- [ ] API responses < 1 second

#### ✅ Mobile Performance
- [ ] Test on actual mobile device
- [ ] Test on slow connection
- [ ] Images load progressively
- [ ] No layout shifts

### Phase 6: Security Testing

#### ✅ Data Privacy
- [ ] Exact locations not visible to public
- [ ] Approximate locations shown to public
- [ ] Admin sees exact locations
- [ ] Phone numbers only visible to matched helpers

#### ✅ Authentication
- [ ] Admin password required
- [ ] Session expires correctly
- [ ] Cannot access admin without login
- [ ] Logout clears session

### Phase 7: Browser Compatibility

#### ✅ Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (if Mac)

#### ✅ Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari Mobile
- [ ] Samsung Internet

### Phase 8: Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Focus indicators visible
- [ ] Alt text on images

## Using the Test Page

1. **Start the dev server**: `npm run dev`
2. **Open test page**: http://localhost:3000/test
3. **Click "Run All Tests"**
4. **Review results**:
   - ✅ Green = Passed
   - ❌ Red = Failed
5. **Fix any failures** before deployment

## Using Debug Console

1. **Open debug page**: http://localhost:3000/debug
2. **Monitor console logs** in real-time
3. **Test database queries**
4. **View system information**

## Common Issues to Check

### "Supabase connection: FAILED"
- Check `.env.local` credentials
- Verify Supabase project is active
- Check network connectivity

### "Storage bucket: NOT FOUND"
- Create `photos` bucket in Supabase
- Make it public
- Set upload policies

### "Table X: FAILED"
- Run the migration SQL files
- Check for typos in table names
- Verify PostGIS extension

### "Real-time subscription: TIMEOUT"
- Enable replication in Supabase
- Go to Database → Replication
- Enable for `assessments` and `gigs`

### "Form submission: FAILED"
- Check browser console for details
- Verify all required fields filled
- Check API route logs

## Pre-Deployment Checklist

- [ ] All tests pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Error handling works
- [ ] Real-time features work
- [ ] Admin functions work
- [ ] Documentation complete

