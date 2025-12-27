# ZYGOTE Backend Environment Variables
# Copy this to backend/.env and update with your actual values

NODE_ENV=development
PORT=5000

# Database - Update with your PostgreSQL credentials
DATABASE_URL=postgresql://postgres:password@localhost:5432/zygote_series

# JWT Secrets - CHANGE THESE IN PRODUCTION!
JWT_SECRET=zygote-super-secret-jwt-key-change-in-production-2025
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=zygote-refresh-token-secret-change-in-production-2025
REFRESH_TOKEN_EXPIRES_IN=30d

# Email (SMTP) - Configure for OTP sending
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@zygote.com

# AWS S3 (Optional - for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=zygote-uploads

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URLs
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001

# Firebase (Optional - for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
