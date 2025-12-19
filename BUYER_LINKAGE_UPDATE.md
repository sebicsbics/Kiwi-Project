# Buyer Linkage Feature - Implementation Guide

## ✅ What Was Implemented

### Backend Changes

1. **Contract Model Update**
   - Added `buyer` field (ForeignKey to User, nullable)
   - Changed `seller` related_name to `contracts_as_seller`
   - Added `buyer` related_name as `contracts_as_buyer`

2. **New Endpoint: My Transactions**
   - `GET /api/contracts/my_transactions/`
   - Returns all contracts where user is seller OR buyer
   - Includes role information and other party name

3. **Auto-Assign Buyer Logic**
   - Modified `ContractDetailView` (GET by ID)
   - Modified `ContractLookupView` (GET by access code)
   - When authenticated user views a contract:
     - If user is NOT the seller
     - AND contract has no buyer yet
     - System automatically assigns user as buyer

4. **Updated Serializers**
   - `MyTransactionSerializer`: New serializer for transaction list
   - Added buyer field to existing serializers
   - Includes role detection (seller/buyer)
   - Shows other party name

### Frontend Changes

1. **Updated Services**
   - Added `MyTransaction` interface
   - Added `getMyTransactions()` method

2. **Updated Home Screen**
   - Replaced mock data with real API calls
   - Added loading and empty states
   - Added pull-to-refresh functionality
   - Auto-refreshes when screen comes into focus (using `useFocusEffect`)
   - Shows transaction status with color-coded badges
   - Displays other party name and role
   - Clickable cards navigate to product details

3. **Status Mapping**
   | Backend Status | UI Text | Color |
   |---------------|---------|-------|
   | DRAFT | Borrador | Gray |
   | AWAITING_PAYMENT | Por pagar | Yellow |
   | LOCKED | En Custodia | Blue |
   | IN_TRANSIT | En Tránsito | Purple |
   | RELEASED | Liberado | Green |
   | COMPLETED | Completado | Dark Green |
   | DISPUTED | En Disputa | Red |
   | REFUNDED | Reembolsado | Orange |

## 🚀 Setup Instructions

### 1. Create and Run Migration

```powershell
cd backend
python manage.py makemigrations transactions
python manage.py migrate
```

### 2. Test the Feature

#### Test Buyer Auto-Assignment

1. **Create a contract as User A:**
   - Login as User A
   - Create a new listing
   - Note the access code (e.g., "AX99KL")

2. **View as User B (becomes buyer):**
   - Login as User B
   - Go to "Buy" → Enter the access code
   - User B is automatically assigned as buyer
   - Contract appears in User B's "Mis transacciones"

3. **Verify in both accounts:**
   - User A sees contract with User B as buyer
   - User B sees contract with User A as seller

#### Test My Transactions

1. Login to the app
2. Home screen shows "Mis transacciones"
3. Pull down to refresh
4. Tap any transaction to view details
5. Navigate away and back - list auto-refreshes

## 📱 User Flow

### Seller Flow
1. Create listing → Contract created with seller assigned
2. Share QR/code with buyer
3. View in "Mis transacciones" → Shows buyer once assigned
4. Status: AWAITING_PAYMENT (yellow badge)

### Buyer Flow
1. Scan QR or enter code
2. **Automatically assigned as buyer** (silent)
3. View contract details
4. Contract appears in "Mis transacciones"
5. Status: AWAITING_PAYMENT (yellow badge)
6. Can proceed to payment

## 🔧 API Examples

### Get My Transactions

```bash
GET /api/contracts/my_transactions/
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "SSD 500 Gb",
    "price": "350.00",
    "status": "AWAITING_PAYMENT",
    "role": "buyer",
    "other_party_name": "Juan Pérez",
    "main_photo": "http://...",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "title": "iPhone 13",
    "price": "5000.00",
    "status": "LOCKED",
    "role": "seller",
    "other_party_name": "María García",
    "main_photo": "http://...",
    "created_at": "2024-01-14T15:20:00Z"
  }
]
```

### Lookup Contract (Auto-assigns buyer)

```bash
GET /api/contracts/lookup/?code=AX99KL
Authorization: Bearer {token}
```

**Behavior:**
- If user is authenticated and not the seller
- AND contract.buyer is null
- System assigns user as buyer automatically
- Returns contract details with buyer assigned

## 🎯 Key Features

✅ **Auto-Assignment**: Buyer linked on first view
✅ **Dual Role Support**: Users can be both sellers and buyers
✅ **Real-time Updates**: Pull-to-refresh and auto-refresh on focus
✅ **Status Tracking**: Color-coded badges for all statuses
✅ **Empty States**: Helpful messages when no transactions
✅ **Loading States**: Smooth loading indicators
✅ **Error Handling**: Graceful error messages

## 🔜 Future Enhancements

- [ ] Push notifications when buyer is assigned
- [ ] Transaction filtering (as seller, as buyer, by status)
- [ ] Transaction search
- [ ] Pagination for large transaction lists
- [ ] Transaction details modal
- [ ] Buyer can "unbind" before payment
- [ ] Multiple buyers support (waitlist)

## 📝 Database Changes

### Migration Summary

```python
# Add buyer field to Contract model
buyer = models.ForeignKey(
    User, 
    on_delete=models.SET_NULL, 
    null=True, 
    blank=True, 
    related_name='contracts_as_buyer'
)
```

### Related Name Changes

- `seller`: `related_name='contracts_as_seller'`
- `buyer`: `related_name='contracts_as_buyer'`

This allows:
```python
user.contracts_as_seller.all()  # Contracts where user is seller
user.contracts_as_buyer.all()   # Contracts where user is buyer
```

## 🧪 Testing Checklist

- [ ] Migration runs successfully
- [ ] Can create contract (seller assigned)
- [ ] Buyer auto-assigned on lookup
- [ ] Buyer auto-assigned on detail view
- [ ] My transactions shows both roles
- [ ] Home screen loads transactions
- [ ] Pull-to-refresh works
- [ ] Auto-refresh on focus works
- [ ] Empty state displays correctly
- [ ] Loading state displays correctly
- [ ] Transaction cards are clickable
- [ ] Status badges show correct colors
- [ ] Other party name displays correctly
- [ ] Role indicator works (seller/buyer)

## 🐛 Troubleshooting

**Problem:** Migration fails with "column already exists"
**Solution:** Drop the column manually or reset migrations

**Problem:** Transactions not showing in home
**Solution:** Check authentication token and API endpoint

**Problem:** Buyer not auto-assigned
**Solution:** Ensure user is authenticated and not the seller

**Problem:** Home screen doesn't refresh
**Solution:** Check useFocusEffect implementation