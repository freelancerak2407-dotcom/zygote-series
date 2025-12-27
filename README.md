# 🧬 ZYGOTE - Medical Learning Platform

> **A doctor-run medical learning platform for MBBS students**

## 📋 Project Overview

ZYGOTE is a comprehensive medical education platform designed by doctors for MBBS students. It provides structured learning content, interactive MCQs, mind maps, and progress tracking across all MBBS years.

### Tech Stack

- **Mobile App**: React Native (Expo)
- **Web Admin CMS**: Next.js + Tailwind CSS
- **Backend API**: Node.js + Express
- **Database**: PostgreSQL
- **File Storage**: AWS S3
- **Payments**: Stripe
- **Authentication**: JWT + Email OTP

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "zygote series"

# Install dependencies for all services
npm run install:all

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run migrate
npm run seed

# Start development servers
npm run dev:backend    # Backend API (port 5000)
npm run dev:admin      # Admin CMS (port 3001)
npm run dev:frontend   # Mobile App (Expo)
```

---

## 📁 Project Structure

```
zygote-series/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── database/    # Database connection & migrations
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Route controllers
│   │   ├── models/      # Database models
│   │   ├── utils/       # Utility functions
│   │   └── server.js    # Entry point
│   └── package.json
│
├── admin/               # Next.js Admin CMS
│   ├── app/            # Next.js app router
│   ├── components/     # React components
│   ├── lib/            # Utilities
│   └── package.json
│
├── frontend/            # React Native Mobile App
│   ├── src/
│   │   ├── screens/    # App screens
│   │   ├── components/ # Reusable components
│   │   ├── navigation/ # Navigation setup
│   │   ├── services/   # API services
│   │   └── utils/      # Utilities
│   ├── App.js
│   └── package.json
│
└── package.json         # Root package.json
```

---

## 🗄️ Database Schema

### Core Tables

- **users** - Students, admins, editors
- **tracks** - MBBS years (1st, 2nd, 3rd, Final)
- **subjects** - Anatomy, Physiology, etc.
- **topics** - Individual chapters
- **notes** - Chapter notes (Markdown/PDF)
- **summaries** - Quick summaries
- **mind_maps** - Visual learning aids
- **mcqs** - Multiple choice questions
- **subscriptions** - User subscriptions
- **analytics** - Learning analytics

---

## 🔐 Default Credentials

### Admin Panel
- **URL**: http://localhost:3001
- **Email**: zygote72@gmail.com
- **Password**: Zygote@123

### Test Student
- **Email**: student@test.com
- **Password**: Student@123

---

## 📚 Academic Structure

### Track 1 - First Year MBBS
- Anatomy
- Physiology
- Biochemistry

### Track 2 - Second Year MBBS
- Pathology
- Microbiology
- Pharmacology

### Track 3 - Third Year MBBS
- Ophthalmology
- ENT
- Community Medicine
- Forensic Medicine

### Track 4 - Final Year MBBS
- Medicine
- Surgery
- Obstetrics & Gynaecology
- Pediatrics
- Orthopedics
- Radiology
- Anaesthesiology
- Psychiatry
- Dermatology

---

## 🎯 Features

### Student App
- ✅ Email + Password Authentication
- ✅ Email OTP Verification
- ✅ Google Sign-in
- ✅ Browse subjects by MBBS year
- ✅ View Notes, Summaries, Mind Maps
- ✅ Take MCQ quizzes
- ✅ Bookmark topics
- ✅ Track progress
- ✅ Dark mode
- ✅ Adjustable font sizes
- ✅ Offline mode (cached content)
- ✅ Stripe subscriptions (6/12/24 months)

### Admin CMS
- ✅ Role-based access (Admin/Editor)
- ✅ Create/Edit/Delete Tracks
- ✅ Create/Edit/Delete Subjects
- ✅ Create/Edit/Delete Topics
- ✅ Upload Notes (Markdown/PDF)
- ✅ Upload Summaries
- ✅ Upload Mind Maps (Images)
- ✅ Create MCQs (Manual + Bulk CSV)
- ✅ Content versioning
- ✅ Analytics dashboard
- ✅ User management
- ✅ Audit logs

---

## 🔧 API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login
POST   /api/auth/verify-otp        - Verify email OTP
POST   /api/auth/resend-otp        - Resend OTP
POST   /api/auth/refresh-token     - Refresh JWT
POST   /api/auth/logout            - Logout
```

### Tracks & Subjects
```
GET    /api/tracks                 - Get all tracks
GET    /api/tracks/:id/subjects    - Get subjects by track
GET    /api/subjects/:id           - Get subject details
GET    /api/subjects/:id/topics    - Get topics by subject
```

### Topics & Content
```
GET    /api/topics/:id             - Get topic details
GET    /api/topics/:id/notes       - Get notes
GET    /api/topics/:id/summary     - Get summary
GET    /api/topics/:id/mindmap     - Get mind map
GET    /api/topics/:id/mcqs        - Get MCQs
```

### Admin
```
POST   /api/admin/tracks           - Create track
PUT    /api/admin/tracks/:id       - Update track
DELETE /api/admin/tracks/:id       - Delete track
POST   /api/admin/subjects         - Create subject
POST   /api/admin/topics           - Create topic
POST   /api/admin/mcqs             - Create MCQ
POST   /api/admin/mcqs/bulk        - Bulk upload MCQs
```

### Subscriptions
```
GET    /api/subscriptions/plans    - Get subscription plans
POST   /api/subscriptions/create   - Create subscription
POST   /api/subscriptions/cancel   - Cancel subscription
POST   /api/webhooks/stripe        - Stripe webhook
```

---

## 🎨 Design Philosophy

ZYGOTE is NOT a coaching app or notes app.  
ZYGOTE is a **medical knowledge system designed by doctors**.

### UI/UX Principles
- ✅ Calm and intelligent
- ✅ Premium feel
- ✅ Clinically accurate
- ✅ Scientifically inspired
- ✅ Distraction-free learning

### Avoid
- ❌ Neon colors
- ❌ Cartoon UI
- ❌ Gamification
- ❌ Over-animation

---

## 💳 Subscription Plans

| Plan | Duration | Price | Features |
|------|----------|-------|----------|
| Basic | 6 months | TBD | All subjects + MCQs |
| Standard | 12 months | TBD | All subjects + MCQs + Priority support |
| Premium | 24 months | TBD | All subjects + MCQs + Lifetime updates |

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Email OTP verification
- Role-based access control
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention
- XSS protection

---

## 📊 Analytics Tracked

- Time spent on topics
- Chapters opened
- Quiz scores
- Last activity timestamp
- Content completion percentage
- User engagement metrics

---

## 🚢 Deployment

### Backend (Railway/Heroku/AWS)
```bash
cd backend
npm run build
npm start
```

### Admin CMS (Vercel/Netlify)
```bash
cd admin
npm run build
# Deploy to Vercel
```

### Mobile App (Expo)
```bash
cd frontend
expo build:android
expo build:ios
```

---

## 📝 Environment Variables

See `.env.example` for all required environment variables.

**Critical Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `AWS_ACCESS_KEY_ID` - AWS S3 credentials
- `SMTP_USER` - Email service credentials

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Admin tests
cd admin
npm test

# Mobile app tests
cd frontend
npm test
```

---

## 📖 Documentation

- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Admin Guide](./docs/ADMIN_GUIDE.md)

---

## 🤝 Contributing

This is a private medical education platform. Contributions are limited to authorized developers only.

---

## 📄 License

UNLICENSED - Proprietary software for ZYGOTE platform only.

---

## 📞 Support

For technical support or questions:
- Email: support@zygote.com
- Documentation: [docs.zygote.com](https://docs.zygote.com)

---

## ⚠️ Disclaimer

**Educational purpose only. Not a substitute for clinical judgment.**

ZYGOTE provides educational content for medical students. It should not be used as the sole source for clinical decision-making. Always consult with qualified healthcare professionals and refer to official medical guidelines.

---

**Last Updated**: December 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
