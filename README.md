# InscribeMate MVP

An accessibility-first web application that connects blind students with volunteers for academic assistance and note-taking support.

## 🚀 Features

- **Simplified Authentication** - No password required, just email and role selection
- **Interactive Search & Matchmaking** - Find volunteers based on location and expertise
- **Text-to-Speech (TTS)** - Full accessibility support with voice announcements
- **Geo-location Visualization** - Interactive map showing available volunteers
- **Role-based Interface** - Different views for Students, Volunteers, and Administrators
- **Real-time Chat** - Communication between students and volunteers
- **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Express.js + Node.js
- **Database:** Supabase (PostgreSQL)
- **UI:** Tailwind CSS + Radix UI
- **Animations:** Framer Motion
- **Deployment:** Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ex-Cummunicado/Today-mvp.git
   cd Today-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your Supabase credentials (optional for demo)

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3001`

## 🎯 Demo Usage

### Authentication
- Enter any email address
- Select your role (Student/Volunteer/Admin)
- Click "Sign In" - no password required!

### Demo Accounts
- **Student Demo:** Click "Student Demo" badge
- **Volunteer Demo:** Click "Volunteer Demo" badge  
- **Admin Demo:** Click "Admin Demo" badge

## 📁 Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── index.js           # Main API entry point
│   ├── routes.js          # API routes
│   └── storage.js         # Memory storage
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
│   └── public/            # Static assets
├── server/                 # Backend Express server
├── shared/                 # Shared code between frontend/backend
└── vercel.json            # Vercel configuration
```

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Framework: Select `Vite`
3. Root Directory: Leave empty
4. Build Command: `npm run build:client`
5. Output Directory: `client/dist`
6. Deploy!

### Environment Variables for Production
Set these in your Vercel dashboard:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:client` - Build frontend only
- `npm run build:server` - Build backend only
- `npm run start` - Start production server
- `npm run check` - Type check

## 🎨 Features Overview

### For Students
- Request assistance from volunteers
- Browse available volunteers by location
- Chat with assigned volunteers
- Track request status

### For Volunteers
- View available requests
- Apply to help students
- Manage applications
- Chat with students

### For Administrators
- Monitor all requests and applications
- Manage user accounts
- View analytics and reports

## 🔒 Security

- All vulnerabilities fixed (0 npm audit issues)
- Environment variables properly configured
- CORS enabled for API endpoints
- Input validation and sanitization

## 📱 Accessibility

- Full keyboard navigation support
- Screen reader compatible
- Text-to-Speech integration
- High contrast design
- Responsive layout

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the deployment guide

---

**Built with ❤️ for accessibility and inclusion**
