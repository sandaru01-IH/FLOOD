# FloodRelief.lk - Flood Damage Assessment & Relief System

A comprehensive web application designed to help Sri Lankans during floods by allowing affected persons to self-assess and submit flood-impact details, and connecting volunteers/helpers with nearby victims through an organized, map-based matching interface.

## 🌟 Features

### 1. Damage Assessment Form
- Simple, step-by-step form (under 2 minutes to complete)
- Collects basic profile, property details, essential losses, family vulnerabilities
- Auto-captures GPS location
- Allows 1-3 photos
- Generates rules-based Damage Severity Score (Low, Moderate, High, Critical)

### 2. Community Help Exchange (Gig Marketplace)
- **Donate Gigs**: People willing to give supplies can post offerings
- **Collect Gigs**: NGOs/collectors can post their needs
- Direct contact between donors and collectors

### 3. Real-Time Visualization Map
- Interactive map showing affected households (colored by severity)
- Helpers and gig locations
- Optional context layers (rainfall, river levels, flood extent, etc.)
- Filters by severity, needs, verification status, area

### 4. Admin Dashboard
- Total reports and statistics
- Severity distribution
- Urgent needs summary
- District heatmap
- High-priority households list
- Ability to verify/approve submissions
- Import external datasets (CSV, GeoJSON)

## 🚀 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Real-time, Storage)
- **Maps**: Leaflet/React-Leaflet
- **Forms**: React Hook Form, Zod
- **Language Support**: English, Sinhala (සිංහල), Tamil (தமிழ்)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Git (for deployment)

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/flood-relief-lk.git
cd flood-relief-lk
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_PASSWORD=your_secure_admin_password
```

### 4. Set Up Supabase Database
1. Go to your Supabase project
2. Open SQL Editor
3. Run the migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_gigs_schema.sql`

### 5. Create Storage Bucket
1. Go to Storage in Supabase
2. Create a bucket named `photos`
3. Make it public
4. Set upload policies

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   ├── admin/             # Admin dashboard
│   ├── assess/             # Damage assessment form
│   ├── gigs/               # Gig marketplace
│   ├── map/                # Interactive map
│   └── test/               # Testing & debugging
├── components/             # React components
│   ├── forms/             # Form components
│   ├── map/               # Map components
│   └── ui/                # UI components
├── lib/                    # Utility functions
├── supabase/              # Database migrations
└── types/                  # TypeScript types
```

## 🧪 Testing

### Automated Test Suite
Visit `/test` to run comprehensive system tests:
- Database connectivity
- API endpoints
- Form submissions
- Real-time features

### Debug Console
Visit `/debug` to monitor:
- Console logs
- System information
- Database queries

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

### Other Platforms
- **Netlify**: Similar to Vercel
- **Render**: Good for full-stack apps
- **Railway**: $5 free credit/month

## 🔒 Security Features

- Row Level Security (RLS) in Supabase
- Approximate location for privacy (exact location only for admins)
- Admin authentication
- Input validation and sanitization

## 🌍 Language Support

The application supports three languages:
- English (en)
- Sinhala (si) - සිංහල
- Tamil (ta) - தமிழ்

Toggle language using the language selector in the header.

## 📱 Mobile-First Design

- Responsive layouts
- Touch-friendly buttons
- Mobile-optimized map filters
- Low bandwidth optimization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Built to help Sri Lankans during flood emergencies. Special thanks to all volunteers and organizations working for flood relief.

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ for Sri Lanka**
