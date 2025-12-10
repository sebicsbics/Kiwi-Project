# Quick Setup Guide for Contracts Feature

## Step-by-Step Installation

### 1. Install Backend Dependencies

```powershell
cd backend
pip install Pillow qrcode[pil] django-fsm
```

### 2. Run Database Migrations

```powershell
cd backend
python manage.py makemigrations transactions
python manage.py migrate
```

### 3. Create Superuser (if not already created)

```powershell
cd backend
python manage.py createsuperuser
```

### 4. Install Frontend Dependencies

```powershell
cd frontend
npm install react-native-qrcode-svg react-native-svg expo-clipboard
```

### 5. Start Backend Server

```powershell
cd backend
python manage.py runserver
```

### 6. Start Frontend (in a new terminal)

```powershell
cd frontend
npm start
```

Then press:
- `a` for Android emulator
- `i` for iOS simulator
- Scan QR for physical device

## Testing the Feature

### Test 1: Create a Contract

1. Login to the app
2. Tap "Sell" button on home screen
3. Fill in the form:
   - Title: "Test Product"
   - Price: "100"
   - Condition: Select any
   - Add at least 1 photo
4. Tap "Publicar"
5. You should see the success screen with QR code and access code

### Test 2: Lookup Contract

1. From home screen, tap "Buy" button
2. Choose "Ingresar código"
3. Enter the access code from Test 1
4. Tap "Buscar producto"
5. You should see the product details

### Test 3: QR Code Scan

1. From home screen, tap "Buy" button
2. Choose "Escanear QR"
3. Grant camera permission
4. Scan the QR code from Test 1
5. You should see the product details

## Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'django'`
**Solution:** Make sure you're in a virtual environment and Django is installed:
```powershell
pip install -r requirements.txt
```

**Problem:** `No such table: contracts`
**Solution:** Run migrations:
```powershell
python manage.py migrate
```

**Problem:** Images not loading
**Solution:** Make sure MEDIA_ROOT and MEDIA_URL are configured in settings.py and URLs include static file serving.

### Frontend Issues

**Problem:** `Module not found: react-native-qrcode-svg`
**Solution:** Install the dependency:
```powershell
npm install react-native-qrcode-svg react-native-svg
```

**Problem:** Camera permission denied
**Solution:** Grant camera permission in device settings or emulator settings.

**Problem:** Cannot connect to backend
**Solution:** Update the API_BASE_URL in `frontend/services/api.ts` to your computer's IP address.

## Admin Panel

Access the admin panel at `http://localhost:8000/admin/` to:
- View all contracts
- Manage contract status
- View uploaded photos
- Test FSM transitions

Login with the superuser credentials you created.

## API Testing with cURL

### Create Contract (requires authentication)

```bash
curl -X POST http://localhost:8000/api/contracts/create/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "title=Test Product" \
  -F "price=100" \
  -F "condition=Nuevo" \
  -F "description=Test description" \
  -F "photos=@/path/to/image1.jpg" \
  -F "photos=@/path/to/image2.jpg"
```

### Lookup Contract (no authentication required)

```bash
curl http://localhost:8000/api/contracts/lookup/?code=AX99KL
```

### Get Contract Details (requires authentication)

```bash
curl http://localhost:8000/api/contracts/1/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Next Steps

After successful testing:
1. Review the FSM status transitions in `backend/transactions/models.py`
2. Implement payment webhook integration for LOCKED status
3. Add buyer confirmation flow for RELEASED status
4. Implement dispute resolution workflow

For more details, see `CONTRACTS_IMPLEMENTATION.md`