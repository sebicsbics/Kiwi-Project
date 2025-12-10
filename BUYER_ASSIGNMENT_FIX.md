# Buyer Assignment Fix

## Problem
When a buyer (different user) tried to view a contract by scanning QR or entering code, they got a 404 error:
```
ERROR  Error loading contract: {"data": {"detail": "Not found."}, "message": "Not found.", "status": 404}
```

## Root Cause
The `ContractDetailView.get_queryset()` was filtering contracts by `Q(seller=user) | Q(buyer=user)` BEFORE the buyer was assigned. Since the buyer field was null, the contract was filtered out, causing a 404.

## Solution

### Backend Fix
Updated `ContractDetailView.get_object()` to:
1. Fetch the contract by ID WITHOUT filtering first
2. Auto-assign buyer if conditions are met
3. THEN check permissions (seller or buyer)
4. Raise PermissionDenied if user is neither seller nor buyer

**Key Change:**
```python
def get_object(self):
    # Get contract WITHOUT filtering
    contract = Contract.objects.get(pk=contract_id)
    
    # Auto-assign buyer
    if user != seller and buyer is None:
        contract.buyer = user
        contract.save()
    
    # Check permission AFTER assignment
    if user != seller and user != buyer:
        raise PermissionDenied()
    
    return contract
```

### Frontend Update
Simplified QR scanning logic to always navigate directly to product detail page, letting the backend handle buyer assignment.

## Testing Steps

### Test 1: Buyer Views Contract via QR Code
1. **User A (Seller)**:
   - Login as User A
   - Create a new listing
   - Note the QR code and access code

2. **User B (Buyer)**:
   - Login as User B
   - Tap "Buy" → "Escanear QR"
   - Scan User A's QR code
   - ✅ Should see contract details (no 404 error)
   - ✅ User B is automatically assigned as buyer

3. **Verify**:
   - User A: Check "Mis transacciones" → Should show User B as buyer
   - User B: Check "Mis transacciones" → Should show contract with User A as seller

### Test 2: Buyer Views Contract via Access Code
1. **User B**:
   - Tap "Buy" → "Ingresar código"
   - Enter the access code from User A's contract
   - ✅ Should see contract details
   - ✅ User B is automatically assigned as buyer

### Test 3: Seller Views Own Contract
1. **User A**:
   - Navigate to their own contract
   - ✅ Should see contract details
   - ✅ Buyer field should show User B (if already assigned)

### Test 4: Third User Cannot View
1. **User C**:
   - Try to view contract created by User A with User B as buyer
   - ✅ Should get "No tienes permiso para ver este contrato" error

## API Behavior

### Before Fix
```
GET /api/contracts/123/
Authorization: Bearer {user_b_token}

Response: 404 Not Found
{
  "detail": "Not found."
}
```

### After Fix
```
GET /api/contracts/123/
Authorization: Bearer {user_b_token}

Response: 200 OK
{
  "id": 123,
  "title": "SSD 500 Gb",
  "seller": {...},
  "buyer": {
    "id": 2,
    "username": "user_b",
    ...
  },
  ...
}
```

## Edge Cases Handled

1. ✅ **Contract with no buyer**: Auto-assigns first viewer (non-seller)
2. ✅ **Contract with existing buyer**: Only seller and assigned buyer can view
3. ✅ **Seller viewing own contract**: No buyer assignment
4. ✅ **Unauthorized user**: Gets permission denied error
5. ✅ **Invalid contract ID**: Gets 404 not found

## Files Modified

1. `backend/transactions/views.py`
   - Updated `ContractDetailView.get_object()`
   - Added proper permission checks

2. `frontend/app/scan-or-enter-code.tsx`
   - Simplified QR scanning logic
   - Removed unnecessary conditional navigation

## Rollback Plan

If issues occur, revert to previous queryset-based filtering:
```python
def get_queryset(self):
    return Contract.objects.filter(
        Q(seller=self.request.user) | Q(buyer=self.request.user)
    )
```

But this will require buyer assignment to happen in a separate endpoint before viewing.