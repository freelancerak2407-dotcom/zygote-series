# 🚀 ZYGOTE Platform - Quick Reference

## 📦 Project Structure

```
zygote-series/
├── 📁 backend/          ✅ Node.js API (COMPLETE)
├── 📁 frontend/         🚧 React Native App (FOUNDATION READY)
├── 📁 admin/            🚧 Next.js Admin CMS (FOUNDATION READY)
└── 📄 Documentation files
```

---

## ⚡ Quick Start Commands

### Backend (Port 5000)
```powershell
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

### Mobile App (Expo)
```powershell
cd frontend
npm install
npm start
```

### Admin CMS (Port 3001)
```powershell
cd admin
npm install
npm run dev
```

---

## 🔐 Login Credentials

**Admin**: zygote72@gmail.com / Zygote@123  
**Student**: student@test.com / Student@123

---

## 🌐 URLs

- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health
- Admin CMS: http://localhost:3001
- Mobile App: Expo Go app

---

## 📋 Key Files

### Documentation
- `README.md` - Project overview
- `COMPLETE_PROJECT_SUMMARY.md` - Full status
- `GETTING_STARTED.md` - Backend setup
- `FRONTEND_GUIDE.md` - Frontend guide
- `ADMIN_CREDENTIALS.md` - Credentials

### Configuration
- `backend/.env` - Backend config (create from ENV_TEMPLATE.md)
- `admin/.env.local` - Admin config (create from .env.example)
- `frontend/app.json` - Expo config

### Templates
- `frontend/SCREEN_TEMPLATES.js` - Mobile screen templates

---

## 🎨 Design System

**Colors**:
- Primary: #2563EB (Medical Blue)
- Secondary: #14B8A6 (Teal)
- Background: #FFFFFF / #0F172A

**Theme**: Medical, calm, professional, no gamification

---

## 📊 API Endpoints

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/verify-otp`

### Content
- GET `/api/tracks`
- GET `/api/subjects/:id/topics`
- GET `/api/topics/:id/notes`
- GET `/api/topics/:id/mcqs`

### Admin
- POST `/api/admin/tracks`
- POST `/api/admin/subjects`
- POST `/api/admin/topics`
- POST `/api/admin/mcqs`

---

## ✅ Status

| Component | Status | Progress |
|-----------|--------|----------|
| Backend API | ✅ Complete | 100% |
| Database | ✅ Complete | 100% |
| Mobile App Foundation | ✅ Complete | 50% |
| Mobile App Screens | 🚧 In Progress | 20% |
| Admin CMS Foundation | ✅ Complete | 40% |
| Admin CMS Pages | 🚧 In Progress | 10% |

---

## 🎯 Next Steps

1. ✅ Backend is production-ready
2. 🚧 Create mobile screens from templates
3. 🚧 Create admin dashboard pages
4. 🚧 Test authentication flow
5. 🚧 Implement content management

---

## 🔧 Tech Stack

**Backend**: Node.js, Express, PostgreSQL  
**Mobile**: React Native, Expo  
**Web**: Next.js 14, Tailwind CSS  
**Auth**: JWT + OTP  
**API**: REST with Axios

---

## 📞 Need Help?

1. Check `COMPLETE_PROJECT_SUMMARY.md`
2. Review `GETTING_STARTED.md`
3. See `FRONTEND_GUIDE.md`
4. Check backend logs
5. Test API with Postman

---

**Version**: 1.0.0  
**Last Updated**: December 26, 2025  
**Status**: Backend Ready, Frontend In Progress
