# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Supabase

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned

### Run Database Migration
1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run it in the SQL Editor

### Create Storage Bucket
1. Go to Storage → Create bucket
2. Name: `photos`
3. Make it **Public**
4. Add allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

### Get Your Credentials
1. Go to Project Settings → API
2. Copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)

## 3. Configure Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ADMIN_PASSWORD=your-secure-password-here
```

## 4. Enable Real-Time (Optional but Recommended)

1. Go to Database → Replication in Supabase
2. Enable replication for:
   - `assessments` table
   - `helpers` table

## 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 6. Test Admin Access

1. Navigate to `/admin/login`
2. Enter the password you set in `ADMIN_PASSWORD`
3. You should see the admin dashboard

## Troubleshooting

### Map not loading?
- Ensure Leaflet CSS is imported (already done in FloodMap component)
- Check browser console for errors
- Verify Supabase connection

### Photos not uploading?
- Check that the `photos` bucket exists and is public
- Verify storage policies allow uploads
- Check file size limits (default: 10MB per file)

### Real-time not working?
- Ensure replication is enabled in Supabase
- Check browser console for WebSocket connection errors
- Verify Supabase project is not paused

### Database errors?
- Verify migration was run successfully
- Check that PostGIS extension is enabled
- Ensure RLS policies are active

## Next Steps

1. Customize translations in `lib/i18n.ts` for full Sinhala/Tamil support
2. Add more context layers via the admin import interface
3. Configure SMS fallback (if needed) - currently not implemented
4. Deploy to Vercel or your preferred hosting platform

