# ZYGOTE Platform - Quick Start Script
# This script will help you set up and run the ZYGOTE platform locally

Write-Host ""
Write-Host "🧬 ================================" -ForegroundColor Cyan
Write-Host "   ZYGOTE Platform Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "📦 Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js >= 18.0.0" -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is installed
Write-Host "🗄️  Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL installed: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL not found. You'll need to install it or use a cloud database." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📥 Installing Dependencies..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location "backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Set-Location ".."

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🗄️  Database Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Do you want to set up the database now? (Y/N)" -ForegroundColor Yellow
$setupDb = Read-Host

if ($setupDb -eq "Y" -or $setupDb -eq "y") {
    Write-Host "Running database migrations..." -ForegroundColor Yellow
    Set-Location "backend"
    npm run migrate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database migrated successfully" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "Do you want to seed the database with sample data? (Y/N)" -ForegroundColor Yellow
        $seedDb = Read-Host
        
        if ($seedDb -eq "Y" -or $seedDb -eq "y") {
            npm run seed
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Database seeded successfully" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "⚠️  Database migration failed. Check your DATABASE_URL in .env" -ForegroundColor Yellow
    }
    
    Set-Location ".."
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🚀 Starting Backend Server" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting backend on port 5000..." -ForegroundColor Yellow
Set-Location "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Set-Location ".."

Write-Host ""
Write-Host "✅ Backend server started!" -ForegroundColor Green
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📋 Next Steps" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "2. Health Check: http://localhost:5000/health" -ForegroundColor White
Write-Host ""
Write-Host "To set up the Admin CMS:" -ForegroundColor Yellow
Write-Host "  cd admin" -ForegroundColor Gray
Write-Host "  npm install" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "To set up the Mobile App:" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor Gray
Write-Host "  npm install" -ForegroundColor Gray
Write-Host "  npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Check README.md for detailed documentation" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Default Admin Credentials:" -ForegroundColor Green
Write-Host "   Email: zygote72@gmail.com" -ForegroundColor White
Write-Host "   Password: Zygote@123" -ForegroundColor White
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
