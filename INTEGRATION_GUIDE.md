# Kiwi - Frontend-Backend Integration Guide

## ✅ Integration Complete

The frontend and backend are now fully integrated with JWT authentication!

## 🚀 What Was Implemented

### Backend (Django)
- ✅ Custom User model with additional fields (phone, CI number, verification status)
- ✅ User registration endpoint (`/api/auth/register/`)
- ✅ User login endpoint (`/api/auth/login/`)
- ✅ User details endpoint (`/api/auth/user/`)
- ✅ JWT token authentication with SimpleJWT
- ✅ CORS configuration for React Native
- ✅ Database migrations applied

### Frontend (React Native)
- ✅ API service layer (`services/api.ts`, `services/auth.ts`)
- ✅ Secure token storage (`utils/storage.ts`)
- ✅ Authentication context (`contexts/AuthContext.tsx`)
- ✅ Updated login screen with real API integration
- ✅ Updated signup screen with real API integration
- ✅ Authentication-based navigation
- ✅ User info display in home screen
- ✅ Logout functionality

## 🧪 Testing the Integration

### 1. Backend is Running
The Django development server is already running at `http://127.0.0.1:8000/`

### 2. Start the Frontend

```bash
cd frontend
npm start
```

Then press:
- `a` for Android emulator
- `i` for iOS simulator
- Scan QR code for physical device

### 3. Test User Registration

1. The app will open to the login screen
2. Click "Sign up" at the bottom
3. Fill in the registration form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test1234!`
   - Confirm Password: `Test1234!`
4. Click "Sign up"
5. You should be automatically logged in and redirected to the home screen

### 4. Test User Login

1. Logout from the home screen (top right icon)
2. On the login screen, enter:
   - Email: `test@example.com`
   - Password: `Test1234!`
3. Click "Sign in"
4. You should be redirected to the home screen with your user info displayed

### 5. Test Token Persistence

1. Close the app completely
2. Reopen the app
3. You should automatically be logged in and see the home screen

## 🔧 Configuration

### Backend URL Configuration

The frontend is configured to connect to:
- **Android Emulator**: `http://10.0.2.2:8000/api`
- **iOS Simulator**: `http://localhost:8000/api`
- **Physical Device**: `http://YOUR_COMPUTER_IP:8000/api`

**For Physical Devices:**

1. Find your computer's IP:
```bash
# Windows
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
```

2. Update `frontend/services/api.ts`:
```typescript
const API_BASE_URL = 'http://YOUR_IP:8000/api'; // e.g., http://192.168.1.2:8000/api
```

3. Update `backend/.env`:
```
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,10.0.2.2,YOUR_IP
CORS_ALLOWED_ORIGINS=http://localhost:8081,http://YOUR_IP:8081,http://YOUR_IP:19006
```

4. Configure Windows Firewall (run as Administrator):
```powershell
New-NetFirewallRule -DisplayName "Django Dev Server" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

5. Start Django server listening on all interfaces:
```bash
python manage.py runserver 0.0.0.0:8000
```

## 📝 API Endpoints

### Register User
```
POST /api/auth/register/
Body: {
  "username": "string",
  "email": "string",
  "password": "string",
  "password2": "string",
  "first_name": "string" (optional),
  "last_name": "string" (optional),
  "phone": "string" (optional)
}
```

### Login User
```
POST /api/auth/login/
Body: {
  "email": "string",
  "password": "string"
}
```

### Get User Details
```
GET /api/auth/user/
Headers: {
  "Authorization": "Bearer <access_token>"
}
```

## 🔐 Security Notes

- Passwords are hashed using Django's built-in password hashing
- JWT tokens are stored securely in AsyncStorage
- Access tokens expire after 3 days
- Refresh tokens expire after 7 days
- CORS is configured to allow requests from the frontend

## 🐛 Troubleshooting

### "Error de conexión" message
- Make sure the backend server is running
- Check that the API_BASE_URL is correct for your device/emulator
- Verify CORS settings in `backend/config/settings.py`

### "Credenciales inválidas" message
- Verify the email and password are correct
- Check that the user exists in the database

### App crashes on startup
- Clear app data and try again
- Check React Native logs: `npx react-native log-android` or `npx react-native log-ios`

## 📱 Next Steps

1. Implement password reset functionality
2. Add email verification
3. Implement KYC verification flow
4. Add social authentication (Google, Facebook)
5. Implement transaction features
6. Add profile editing

## 🛠 Development Commands

### Backend
```bash
cd backend
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # macOS/Linux

# Run server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Frontend
```bash
cd frontend

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Install dependencies
npm install
```

## 🎉 Success!

Your Kiwi app now has a fully functional authentication system with real backend integration!