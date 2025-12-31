# 🚀 ZYGOTE - Quick Setup Guide

**Last Updated**: December 31, 2025

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 18+ installed
- ✅ PostgreSQL installed and running
- ⏳ Gmail account (for SMTP emails) - optional for testing
- ⏳ AWS account (for S3 uploads) - optional for testing

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Create Environment Files

```powershell
# Backend environment
cd backend
Copy-Item .env.example .env

# Admin environment
cd ..\admin
"NEXT_PUBLIC_API_URL=http://localhost:5000/api" | Out-File -FilePath .env.local -Encoding utf8
```

### Step 2: Configure Backend `.env`

Edit `backend/.env` with minimum required values:

```env
# Minimum configuration for local testing
NODE_ENV=development
PORT=5000

# Database (REQUIRED)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/zygote_series

# JWT (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-change-this
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-this

# Email (OPTIONAL for testing - will log to console if not set)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AWS S3 (OPTIONAL for testing - will fail gracefully if not set)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=zygote-uploads

# URLs
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### Step 3: Set Up Database

```powershell
# Create PostgreSQL database
createdb zygote_series

# Run migrations
cd backend
npm run migrate

# Seed sample data
npm run seed
```

### Step 4: Install Dependencies

```powershell
# Backend
cd backend
npm install

# Admin
cd ..\admin
npm install

# Frontend
cd ..\frontend
npm install
```

### Step 5: Start All Services

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Admin CMS:**
```powershell
cd admin
npm run dev
```

**Terminal 3 - Mobile App:**
```powershell
cd frontend
npm start
```

---

## 🎯 Access Points

Once running:

- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Admin CMS**: http://localhost:3001
- **Mobile App**: Expo DevTools will open automatically

---

## 🔑 Default Credentials

After seeding, you can login with:

**Admin Account:**
- Email: `admin@zygote.com`
- Password: `admin123`

**Student Account:**
- Email: `student@zygote.com`
- Password: `student123`

---

## 🧪 Testing Without External Services

### Option 1: Mock Email Service

Edit `backend/src/services/emailService.js`:

```javascript
// Temporarily replace sendOTP method
async sendOTP(email, otp, fullName = 'User') {
    // MOCK: Just log to console
    console.log('=================================');
    console.log('📧 OTP EMAIL (MOCK)');
    console.log('=================================');
    console.log(`To: ${email}`);
    console.log(`Name: ${fullName}`);
    console.log(`OTP: ${otp}`);
    console.log('=================================');
    
    return { success: true, messageId: 'mock-' + Date.now() };
}
```

### Option 2: Mock File Uploads

Edit `backend/src/services/uploadService.js`:

```javascript
// Temporarily replace upload methods
async uploadPDF(file) {
    // MOCK: Return fake URL
    console.log('📄 PDF Upload (MOCK):', file.originalname);
    return {
        url: `http://localhost:5000/uploads/${file.originalname}`,
        key: `mock-${Date.now()}-${file.originalname}`
    };
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Database Connection Error

**Error**: `ECONNREFUSED` or `database "zygote_series" does not exist`

**Solution**:
```powershell
# Check if PostgreSQL is running
pg_isready

# Create database if missing
createdb zygote_series

# Verify DATABASE_URL in backend/.env
```

### Issue 2: Port Already in Use

**Error**: `Port 5000 is already in use`

**Solution**:
```powershell
# Find process using port
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### Issue 3: JWT Secret Error

**Error**: `secretOrPrivateKey must have a value`

**Solution**:
```env
# Add to backend/.env
JWT_SECRET=my-super-secret-key-at-least-32-characters-long
REFRESH_TOKEN_SECRET=my-refresh-secret-also-very-long
```

### Issue 4: SMTP Email Error

**Error**: `Invalid login` or `Authentication failed`

**Solution**:
```
1. Enable 2FA on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in SMTP_PASS (not your regular password)

OR temporarily mock emails (see above)
```

### Issue 5: Expo/Frontend Won't Start

**Error**: Various Expo errors

**Solution**:
```powershell
cd frontend
rm -rf node_modules
npm install
npm start -- --clear
```

---

## 📱 Testing the Mobile App

### Using Expo Go (Easiest):

1. Install Expo Go on your phone:
   - iOS: App Store
   - Android: Play Store

2. Start the frontend:
   ```powershell
   cd frontend
   npm start
   ```

3. Scan QR code with:
   - iOS: Camera app
   - Android: Expo Go app

### Using Emulator:

**Android:**
```powershell
cd frontend
npm run android
```

**iOS (Mac only):**
```powershell
cd frontend
npm run ios
```

---

## 🧪 API Testing

### Using PowerShell:

**Register User:**
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    fullName = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Login:**
```powershell
$body = @{
    email = "admin@zygote.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$token = $response.data.accessToken
```

**Get Tracks:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/tracks" `
    -Method GET `
    -Headers @{ Authorization = "Bearer $token" }
```

---

## 📊 Verify Setup

Run this checklist:

- [ ] Backend starts without errors
- [ ] Health check returns success: http://localhost:5000/health
- [ ] Admin CMS loads: http://localhost:3001
- [ ] Can login to admin with default credentials
- [ ] Mobile app loads in Expo
- [ ] Can register new user (check console for OTP if email not configured)
- [ ] Can view tracks/subjects/topics

---

## 🎯 Next Steps After Setup

1. **Test Authentication Flow**:
   - Register → Get OTP → Verify → Login

2. **Test Admin Functions**:
   - Login to admin
   - Create track/subject/topic
   - Upload files (if S3 configured)

3. **Test Mobile App**:
   - Browse content
   - Take MCQ quiz
   - Bookmark topics

4. **Complete Missing Screens**:
   - See `MISSING_ITEMS_REPORT.md` for details

---

## 🆘 Need Help?

### Check Logs:

**Backend:**
- Console output shows all requests
- Check for errors in red

**Admin:**
- Browser console (F12)
- Network tab for API calls

**Frontend:**
- Expo DevTools
- Metro bundler console

### Common Commands:

```powershell
# Clear all caches
cd backend && rm -rf node_modules && npm install
cd admin && rm -rf .next node_modules && npm install
cd frontend && rm -rf node_modules && npm install

# Reset database
cd backend
npm run migrate
npm run seed

# Check if services are running
netstat -ano | findstr :5000  # Backend
netstat -ano | findstr :3001  # Admin
netstat -ano | findstr :19000 # Expo
```

---

## 📝 Environment Variables Reference

### Backend `.env`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | development | Environment mode |
| `PORT` | No | 5000 | Server port |
| `DATABASE_URL` | **YES** | - | PostgreSQL connection |
| `JWT_SECRET` | **YES** | - | JWT signing key |
| `REFRESH_TOKEN_SECRET` | **YES** | - | Refresh token key |
| `SMTP_HOST` | No | smtp.gmail.com | Email server |
| `SMTP_PORT` | No | 587 | Email port |
| `SMTP_USER` | No | - | Email username |
| `SMTP_PASS` | No | - | Email password |
| `AWS_ACCESS_KEY_ID` | No | - | S3 access key |
| `AWS_SECRET_ACCESS_KEY` | No | - | S3 secret key |
| `AWS_S3_BUCKET` | No | zygote-uploads | S3 bucket name |

### Admin `.env.local`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | **YES** | - | Backend API URL |

---

## ✅ Success Indicators

You'll know setup is successful when:

1. ✅ Backend shows: `✅ Server running on port 5000`
2. ✅ Health check returns: `{"success": true, "message": "ZYGOTE API is running"}`
3. ✅ Admin CMS loads without errors
4. ✅ Can login to admin dashboard
5. ✅ Mobile app loads in Expo
6. ✅ Can browse tracks/subjects in mobile app

---

**Setup Time**: 15-30 minutes (depending on experience)

**Status**: Ready to develop! 🚀

---

*Last Updated: December 31, 2025, 1:40 PM IST*
